'use client';

import { useEffect, useState, useRef } from 'react';
import type { Query, DocumentData } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface CollectionState<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
}

function getQueryPath<T>(query: Query<T>): string | null {
  try {
    // This uses a non-public but currently stable property to get the path.
    // It's better than nothing for creating a stable dependency key.
    return (query as any)._query.path.segments.join('/');
  } catch (e) {
    // Fallback if the internal property changes
    console.warn("Could not determine query path for useCollection dependency.", e);
    return null;
  }
}

export function useCollection<T extends DocumentData>(
  query: Query<T> | null
) {
  const [state, setState] = useState<CollectionState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const errorEmittedRef = useRef(false);
  const queryPath = query ? getQueryPath(query) : null;

  useEffect(() => {
    if (!query) {
      setState({ data: null, loading: false, error: null });
      return () => {};
    }
    
    // Reset state and error flag when the query changes
    setState({ data: null, loading: true, error: null });
    errorEmittedRef.current = false;

    const unsubscribe = onSnapshot(
      query,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(
          (doc) => ({ ...(doc.data() as T), id: doc.id })
        );
        setState({ data, loading: false, error: null });
      },
      (error) => {
        if (error.code === 'permission-denied' && !errorEmittedRef.current) {
          const permissionError = new FirestorePermissionError(
            {
              path: queryPath || 'unknown query path',
              operation: 'list',
            },
            error
          );
          errorEmitter.emit('permission-error', permissionError);
          // Set the flag to prevent re-emitting for this specific query instance
          errorEmittedRef.current = true; 
        }
        console.error('useCollection error:', error);
        setState({ data: null, loading: false, error });
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryPath]); // Only re-run the effect if the query's stable path changes.

  return state;
}
