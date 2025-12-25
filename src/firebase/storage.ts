'use client';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeFirebase } from './index';

async function getServices() {
  const { storage } = await initializeFirebase();
  return { storage };
}

export async function uploadFileAndGetURL(userId: string, file: File): Promise<string> {
  const { storage } = await getServices();
  
  // Create a unique file path
  const filePath = `projects/${userId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, filePath);

  // Upload the file
  const uploadResult = await uploadBytes(storageRef, file);

  // Get the download URL
  const downloadURL = await getDownloadURL(uploadResult.ref);

  return downloadURL;
}
