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

  // Memoize the path of the query to use as a stable dependency.
  // This is the key to preventing infinite loops.
  const queryPath = useMemo(() => {
    if (!query) return null;
    // The internal _query.path.segments is a stable representation of the query's location.
    return (query as any)._query.path.segments.join('/');
  }, [query]);


  useEffect(() => {
    if (!query) {
      setState({ data: null, loading: false, error: null });
      return () => {};
    }

    setState({ data: null, loading: true, error: null });

    const unsubscribe = onSnapshot(
      query,
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
              path: queryPath || 'unknown path',
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

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryPath]); // Only re-run the effect if the query's path changes.

  return state;
}
