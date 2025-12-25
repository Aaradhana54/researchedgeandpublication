'use client';

// A more specific error message for Firebase authentication issues.
export function getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
        // --- Auth Errors ---
        case 'auth/invalid-credential':
            return 'Invalid email or password. Please try again.';
        case 'auth/email-already-in-use':
            return 'This email is already associated with an account.';
        case 'auth/weak-password':
            return 'The password is too weak. Please use at least 6 characters.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/too-many-requests':
            return 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
        case 'auth/popup-closed-by-user':
            return 'The sign-in window was closed before completing the process. Please try again.';
        case 'auth/cancelled-popup-request':
             return 'The sign-in window was closed before completing the process. Please try again.';

        // --- Firestore Errors ---
        case 'permission-denied':
            return "You don't have permission to perform this action.";
        
        // --- General Errors ---
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection and try again.';
        
        default:
            return 'An unexpected error occurred. Please try again later.';
    }
}


// --- Contextual Firestore Security Rule Error Handling ---

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

/**
 * A custom error class to provide detailed context about Firestore security rule failures.
 * This should only be used in a development environment.
 */
export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;
  public readonly serverError: any;

  constructor(context: SecurityRuleContext, serverError?: any) {
    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(context, null, 2)}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    this.serverError = serverError;

    // This is necessary for transitioning to a custom Error type.
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
