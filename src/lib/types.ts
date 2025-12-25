import type { Timestamp } from 'firebase/firestore';

export type Testimonial = {
  name: string;
  designation: string;
  message: string;
  avatarId?: string;
};

export type Service = {
  title: string;
  description: string;
};

// --- Firestore Data Types ---

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
  createdAt: Timestamp;
};

export type ProjectServiceType =
  | 'thesis-dissertation'
  | 'research-paper'
  | 'book-writing'
  | 'review-paper'
  | 'research-publication'
  | 'book-publishing';

export type CourseLevel = 'ug' | 'pg' | 'phd';

export interface Project {
  id?: string;
  title: string;
  serviceType: ProjectServiceType;
  topic?: string;
  courseLevel?: CourseLevel;
  deadline?: Timestamp;
  synopsisFileUrl?: string; // Optional file upload
  referencingStyle?: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  wantToPublish?: boolean;
  publishWhere?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
