'use client';

import {
  collection,
  addDoc,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { initializeFirebase } from './index';
import type { Project } from '@/lib/types';

async function getServices() {
  const { firestore } = await initializeFirebase();
  return { firestore };
}

// --- Project Functions ---

export async function createProject(
  userId: string,
  projectData: Partial<Omit<Project, 'id' | 'deadline'>> & { title: string; serviceType: Project['serviceType']; deadline?: Date }
) {
  const { firestore } = await getServices();
  const projectsColRef = collection(firestore, 'projects');

  const { deadline, ...restOfData } = projectData;

  const newProject: Omit<Project, 'id'> = {
    userId,
    title: restOfData.title,
    serviceType: restOfData.serviceType,
    topic: restOfData.topic || '',
    courseLevel: restOfData.courseLevel,
    referencingStyle: restOfData.referencingStyle,
    pageCount: restOfData.pageCount,
    wordCount: restOfData.wordCount,
    language: restOfData.language,
    wantToPublish: restOfData.wantToPublish,
    publishWhere: restOfData.publishWhere,
    synopsisFileUrl: restOfData.synopsisFileUrl,
    deadline: deadline ? Timestamp.fromDate(deadline) : undefined,
    currentStage: 'Initiation',
    progressPercent: 0,
    status: 'active',
    approved: false, // Default to not approved
    assignedTeam: [],
    createdAt: serverTimestamp() as any, // Cast because SDK returns a sentinel value
    updatedAt: serverTimestamp() as any,
  };

  const docRef = await addDoc(projectsColRef, newProject);
  return docRef.id;
}

export async function listProjectsForUser(userId: string) {
  const { firestore } = await getServices();
  const projectsColRef = collection(firestore, 'projects');
  const q = query(projectsColRef, where('userId', '==', userId));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as Project)
  );
}

export async function updateProjectTitle(projectId: string, newTitle: string) {
  const { firestore } = await getServices();
  const projectDocRef = doc(firestore, 'projects', projectId);

  await updateDoc(projectDocRef, {
    title: newTitle,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Example of a function restricted to staff/admin.
 * Security rules will enforce this, but client-side checks can improve UX.
 */
export async function staffUpdateProjectProgress(
  projectId: string,
  progress: number
) {
  const { firestore } = await getServices();
  const projectDocRef = doc(firestore, 'projects', projectId);

  await updateDoc(projectDocRef, {
    progressPercent: progress,
    updatedAt: serverTimestamp(),
  });
}
