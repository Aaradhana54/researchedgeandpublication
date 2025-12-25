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
import { firestore } from './client';
import type { Project } from '@/lib/types';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';


// --- Project Functions ---

export async function createProject(
  userId: string,
  projectData: Partial<Omit<Project, 'id' | 'deadline'>> & { title: string; serviceType: Project['serviceType']; deadline?: Date, synopsisFileUrl?: string }
) {
  const projectsColRef = collection(firestore, 'projects');

  const newProjectData: Omit<Project, 'id'> = {
    userId,
    title: projectData.title,
    serviceType: projectData.serviceType,
    currentStage: 'Initiation',
    progressPercent: 0,
    status: 'active',
    approved: false, // Default to false, can be changed by staff/admin
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
  
  addDoc(projectsColRef, newProjectData)
    .then(docRef => {
      return docRef.id;
    })
    .catch(error => {
       if (error.code === 'permission-denied') {
          // Destructure to remove non-serializable Timestamps for the error context
          const { createdAt, updatedAt, ...serializableData } = newProjectData;
          const permissionError = new FirestorePermissionError({
            path: projectsColRef.path,
            operation: 'create',
            requestResourceData: serializableData
          }, error);
          errorEmitter.emit('permission-error', permissionError);
        }
        // Re-throw the original error to be caught by the calling function's catch block
        throw error;
    });
}

export async function listProjectsForUser(userId: string) {
  const projectsColRef = collection(firestore, 'projects');
  const q = query(projectsColRef, where('userId', '==', userId));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as Project)
  );
}

export async function updateProjectTitle(projectId: string, newTitle: string) {
  const projectDocRef = doc(firestore, 'projects', projectId);
  const updateData = {
    title: newTitle,
    updatedAt: serverTimestamp(),
  };

  updateDoc(projectDocRef, updateData)
    .catch(error => {
       if (error.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: projectDocRef.path,
            operation: 'update',
            requestResourceData: updateData
          }, error);
          errorEmitter.emit('permission-error', permissionError);
        }
        throw error;
    });
}
