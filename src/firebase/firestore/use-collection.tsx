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

  const queryMemo = useMemo(() => query, [query]);

  useEffect(() => {
    if (!queryMemo) {
      setState({ data: null, loading: false, error: null });
      return () => {}; // Return an empty cleanup function
    }

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

    return () => unsubscribe();
  }, [queryMemo]);

  return state;
}
