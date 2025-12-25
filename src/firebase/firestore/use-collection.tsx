'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Query, DocumentData } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface CollectionState<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
}

export function useCollection<T extends DocumentData>(
  query: Query<T> | null
) {
  const [state, setState] = useState<CollectionState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // We memoize the query itself to prevent re-running the effect on every render.
  // The user of the hook is responsible for memoizing the query object if it's complex.
  const queryMemo = useMemo(() => query, [query]);

  useEffect(() => {
    // If the query is not yet available (e.g., waiting for firestore instance),
    // set loading to false and do nothing. This is the critical check.
    if (!queryMemo) {
      setState({ data: null, loading: false, error: null });
      return () => {}; // Return an empty cleanup function
    }

    // Set loading to true only when we have a valid query and are about to fetch.
    setState({ data: null, loading: true, error: null });

    const unsubscribe = onSnapshot(
      queryMemo,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(
          (doc) => ({ ...(doc.data() as T), id: doc.id })
        );
        setState({ data, loading: false, error: null });
      },
      (error) => {
        if (error.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError(
            {
              path: (queryMemo as any)._query.path.segments.join('/'),
              operation: 'list',
            },
            error
          );
          errorEmitter.emit('permission-error', permissionError);
        }
        console.error('useCollection error:', error);
        setState({ data: null, loading: false, error });
      }
    );

    // Cleanup the subscription on unmount.
    return () => unsubscribe();
  }, [queryMemo]); // The effect now correctly depends only on the memoized query.

  return state;
}
