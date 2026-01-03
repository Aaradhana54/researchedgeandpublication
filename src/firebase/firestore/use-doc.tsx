
'use client';

import { useEffect, useState, useRef } from 'react';
import type { DocumentReference, DocumentData } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface DocState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useDoc<T extends DocumentData>(
  ref: DocumentReference<T> | null
) {
  const [state, setState] = useState<DocState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  
  const errorEmittedRef = useRef(false);
  const docPath = ref?.path;

  useEffect(() => {
    if (!ref) {
      setState({ data: null, loading: true, error: null });
      return;
    }

    setState((prevState) => ({ ...prevState, loading: true }));
    errorEmittedRef.current = false;

    const unsubscribe = onSnapshot(
      ref,
      (doc) => {
        if (doc.exists()) {
          setState({
            data: { ...(doc.data() as T), id: doc.id },
            loading: false,
            error: null,
          });
        } else {
          setState({ data: null, loading: false, error: null });
        }
      },
      (error) => {
        if (error.code === 'permission-denied' && !errorEmittedRef.current) {
          const permissionError = new FirestorePermissionError(
            {
              path: ref.path,
              operation: 'get',
            },
            error
          );
          errorEmitter.emit('permission-error', permissionError);
          errorEmittedRef.current = true;
        }
        console.error('useDoc error:', error);
        setState({ data: null, loading: false, error });
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docPath]);

  return state;
}

