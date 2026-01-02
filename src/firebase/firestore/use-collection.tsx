
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
  mutate: () => void;
}

function getQueryPath(query: Query): string {
    // A more robust way to get the path, falling back to older internal properties.
    if ((query as any)._query) {
        // This works for v9+ of the SDK
        const path = (query as any)._query.path;
        if (path && path.segments) {
            return path.segments.join('/');
        }
    }
    
    // Fallback for older/different internal structures.
    if ((query as any).path) {
        return (query as any).path;
    }
    
    console.warn("Could not determine query path for useCollection dependency.");
    // As a last resort, try to serialize the query to create a somewhat unique key.
    // This is not ideal as it can be verbose and might change between renders for the same logical query.
    try {
        return JSON.stringify(query);
    } catch {
        return 'unknown-query-path';
    }
}


export function useCollection<T extends DocumentData>(
  query: Query<T> | null
): CollectionState<T> {
  const [state, setState] = useState<CollectionState<T>>({
    data: null,
    loading: true,
    error: null,
    mutate: () => {},
  });

  const errorEmittedRef = useRef(false);
  // Use a combination of the query path and the internal query constraints to form a more stable key.
  const queryKey = query ? getQueryPath(query) + JSON.stringify((query as any)._query?.constraints) : null;
  
  const mutate = () => {
    if (!query) {
      setState({ data: null, loading: false, error: null, mutate });
      return;
    }

    setState((prevState) => ({ ...prevState, loading: true, error: null }));
    errorEmittedRef.current = false;
    
    const unsubscribe = onSnapshot(
      query,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(
          (doc) => ({ ...(doc.data() as T), id: doc.id })
        );
        setState({ data, loading: false, error: null, mutate });
      },
      (error) => {
        if (error.code === 'permission-denied' && !errorEmittedRef.current) {
          const permissionError = new FirestorePermissionError(
            {
              path: getQueryPath(query) || 'unknown query path',
              operation: 'list',
            },
            error
          );
          errorEmitter.emit('permission-error', permissionError);
          errorEmittedRef.current = true;
        }
        console.error('useCollection error:', error);
        setState({ data: null, loading: false, error, mutate });
      }
    );
     return unsubscribe;
  };


  useEffect(() => {
    const unsubscribe = mutate();
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  return { ...state, mutate };
}
