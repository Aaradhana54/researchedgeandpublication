import type { Timestamp } from 'firebase/firestore';

export type Testimonial = {
  name: string;
  designation: string;
  message: string;
  avatarId: string;
};

export type Service = {
  title: string;
  description: string;
};

// --- Firestore Data Types ---

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'client' | 'admin' | 'staff';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ProjectServiceType =
  | 'thesis-dissertation'
  | 'research-paper'
  | 'book-writing'
  | 'research-publication'
  | 'book-publishing';

export interface Project {
  id?: string;
  userId: string; // Owner UID
  title: string;
  serviceType: ProjectServiceType;
  currentStage: string;
  progressPercent: number; // 0-100
  status: 'active' | 'completed' | 'on-hold';
  assignedTeam: string[]; // Array of staff/admin UIDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Add other types as needed from your spec...
