
'use client';

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  type Firestore,
} from 'firebase/firestore';

/**
 * Assigns a lead to a sales person using a round-robin algorithm.
 * @param firestore The Firestore instance.
 * @returns The UID of the assigned sales person.
 */
export async function assignLeadToSalesPerson(firestore: Firestore): Promise<string | null> {
  try {
    const salesTeamQuery = query(
      collection(firestore, 'users'),
      where('role', 'in', ['sales-team', 'sales-manager'])
    );
    const salesTeamSnapshot = await getDocs(salesTeamQuery);
    const salesTeam = salesTeamSnapshot.docs.map((doc) => ({
      ...doc.data(),
      uid: doc.id,
    }));

    if (salesTeam.length === 0) {
      console.warn('No users with "sales-team" or "sales-manager" role found.');
      return null;
    }

    const metadataRef = doc(firestore, 'metadata', 'app-state');
    const metadataSnap = await getDoc(metadataRef);

    let lastIndex = -1;
    if (metadataSnap.exists()) {
      lastIndex = metadataSnap.data().salesLeadIndex ?? -1;
    }

    const nextIndex = (lastIndex + 1) % salesTeam.length;
    const assignedSalesPerson = salesTeam[nextIndex];

    // Use setDoc with merge:true to create the document if it doesn't exist, or update it if it does.
    await setDoc(metadataRef, { salesLeadIndex: nextIndex }, { merge: true });

    return assignedSalesPerson.uid;
  } catch (error) {
    console.error('Error assigning lead to salesperson:', error);
    // Fallback or error handling, maybe assign to a default person or just return null
    return null;
  }
}
