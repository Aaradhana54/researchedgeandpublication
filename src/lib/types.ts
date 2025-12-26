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
export type UserRole =
  | 'client'
  | 'admin'
  | 'author'
  | 'referral-partner'
  | 'writing-team'
  | 'sales-team'
  | 'publication-team'
  | 'accounts-team';

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
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
  userId: string;
  title: string;
  serviceType: ProjectServiceType;
  topic?: string;
  courseLevel?: CourseLevel;
  deadline?: Timestamp;
  synopsisFileUrl?: string;
  referencingStyle?: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  wantToPublish?: boolean;
  publishWhere?: string;
  status?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Task {
  id?: string;
  projectId: string;
  assignedTo: string; // User ID of writer/editor
  description: string;
  dueDate?: Timestamp;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BookSale {
    id?: string;
    bookId: string;
    platform: string;
    saleDate: Timestamp;
    quantity: number;
    revenue: number;
    createdAt: Timestamp;
}

export interface Payout {
    id?: string;
    userId: string; // User ID of author/partner
    amount: number;
    status: 'pending' | 'paid';
    requestDate: Timestamp;
    paidDate?: Timestamp;
    createdAt: Timestamp;
}

export interface Invoice {
    id?: string;
    projectId: string;
    userId: string;
    amount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    issueDate: Timestamp;
    dueDate: Timestamp;
    pdfUrl?: string;
    createdAt: Timestamp;
}

export interface Notification {
    id?: string;
    userId: string;
    message: string;
    isRead: boolean;
    createdAt: Timestamp;
}
