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
  projectData: Partial<Omit<Project, 'id' | 'deadline'>> & { title: string; serviceType: Project['serviceType']; deadline?: Date, synopsisFileUrl?: string }
) {
  const { firestore } = await getServices();
  const projectsColRef = collection(firestore, 'projects');

  // Build the project object safely, only including fields that have values.
  const newProjectData: Omit<Project, 'id'> = {
    userId,
    title: projectData.title,
    serviceType: projectData.serviceType,
    currentStage: 'Initiation',
    progressPercent: 0,
    status: 'active',
    approved: false,
    assignedTeam: [],
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  if (projectData.topic) newProjectData.topic = projectData.topic;
  if (projectData.courseLevel) newProjectData.courseLevel = projectData.courseLevel;
  if (projectData.deadline) newProjectData.deadline = Timestamp.fromDate(projectData.deadline);
  if (projectData.synopsisFileUrl) newProjectData.synopsisFileUrl = projectData.synopsisFileUrl;
  if (projectData.referencingStyle) newProjectData.referencingStyle = projectData.referencingStyle;
  if (projectData.pageCount) newProjectData.pageCount = projectData.pageCount;
  if (projectData.wordCount) newProjectData.wordCount = projectData.wordCount;
  if (projectData.language) newProjectData.language = projectData.language;
  if (projectData.wantToPublish) newProjectData.wantToPublish = projectData.wantToPublish;
  if (projectData.publishWhere) newProjectData.publishWhere = projectData.publishWhere;

  const docRef = await addDoc(projectsColRef, newProjectData);
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
