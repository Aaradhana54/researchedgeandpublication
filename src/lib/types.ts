

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
  mobile?: string;
  role: UserRole;
  createdAt: Timestamp;
  referralCode?: string; // For partners
  referredBy?: string; // For clients
};

export type ProjectServiceType =
  | 'thesis-dissertation'
  | 'research-paper'
  | 'book-writing'
  | 'review-paper'
  | 'research-publication'
  | 'book-publishing';

export type CourseLevel = 'ug' | 'pg' | 'phd';
export type ProjectStatus = 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed';

export interface Project {
  id?: string;
  userId: string;
  title: string;
  mobile?: string;
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
  status?: ProjectStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Sales Finalization Fields
  dealAmount?: number;
  advanceReceived?: number;
  discussionNotes?: string;
  paymentScreenshotUrl?: string;
  finalDeadline?: Timestamp;
  finalizedAt?: Timestamp;
  finalizedBy?: string; // UID of the sales person
  assignedWriterId?: string; // UID of the writer
}

export interface ContactLead {
    id?: string;
    name: string;
    email: string;
    phone: string;
    serviceType: string;
    message?: string;
    referredByPartnerId: string;
    status: 'new' | 'contacted' | 'converted';
    createdAt: Timestamp;
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

export interface Referral {
    id?: string;
    partnerId: string; // UID of the referral partner
    referredUserId: string; // UID of the new client
    status: 'pending' | 'converted';
    createdAt: Timestamp;
}

export type MarketingAssetCategory = 'demo-thesis' | 'demo-synopsis' | 'general-marketing';

export interface MarketingAsset {
    id?: string;
    title: string;
    description: string;
    category: MarketingAssetCategory;
    fileName: string;
    downloadUrl: string;
    fileType: string;
    createdAt: Timestamp;
}

    
