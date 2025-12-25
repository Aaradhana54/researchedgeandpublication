import { EventEmitter } from 'events';
import type { FirestorePermissionError } from './errors';

type ErrorEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// We use the `events` module for a simple, universal event emitter.
// This could be replaced with any other event emitter library.
class TypedEventEmitter {
  private emitter = new EventEmitter();

  emit<T extends keyof ErrorEvents>(event: T, ...args: Parameters<ErrorEvents[T]>) {
    this.emitter.emit(event, ...args);
  }

  on<T extends keyof ErrorEvents>(event: T, listener: ErrorEvents[T]) {
    this.emitter.on(event, listener);
  }

  off<T extends keyof ErrorEvents>(event: T, listener: ErrorEvents[T]) {
    this.emitter.off(event, listener);
  }
}

export const errorEmitter = new TypedEventEmitter();
