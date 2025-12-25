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
} from 'firebase/firestore';
import { initializeFirebase } from './index';
import type { ProjectServiceType, Project } from '@/lib/types';

async function getServices() {
  const { firestore } = await initializeFirebase();
  return { firestore };
}

// --- Project Functions ---

export async function createProject(
  userId: string,
  title: string,
  serviceType: ProjectServiceType
) {
  const { firestore } = await getServices();
  const projectsColRef = collection(firestore, 'projects');

  const newProject: Omit<Project, 'id'> = {
    userId,
    title,
    serviceType,
    currentStage: 'Initiation',
    progressPercent: 0,
    status: 'active',
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
