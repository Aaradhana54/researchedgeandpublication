
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
