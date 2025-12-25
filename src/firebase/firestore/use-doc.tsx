'use client';

import { useEffect, useState, useMemo } from 'react';
import type { DocumentReference, DocumentData } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

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

  const refMemo = useMemo(() => ref, [ref?.path, ref?.converter]);

  useEffect(() => {
    if (!refMemo) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((prevState) => ({ ...prevState, loading: true }));

    const unsubscribe = onSnapshot(
      refMemo,
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
        console.error('useDoc error:', error);
        setState({ data: null, loading: false, error });
      }
    );

    return () => unsubscribe();
  }, [refMemo]);

  return state;
}
