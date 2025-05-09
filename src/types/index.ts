
import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string; 
  uid: string; 
  firstName: string;
  lastName: string;
  email: string;
  headline?: string;
  profilePictureUrl?: string;
  coverPhotoUrl?: string;
  summary?: string;
  location?: string;
  connectionsCount: number; 
  connections?: string[]; 
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: Skill[];
  recommendations?: Recommendation[];
  createdAt: Timestamp | string; 
  updatedAt?: Timestamp | string; 
  lastLogin?: Timestamp | string; 
  isActive?: boolean; 
  pendingInvitationsCount?: number;
  pendingInvitations?: string[]; // Could be array of invitation IDs or user IDs who sent them
}

export interface WorkExperience {
  id: string;
  title: string;
  companyName: string;
  location?: string;
  startDate: string; 
  endDate?: string; 
  description?: string;
  companyLogoUrl?: string;
}

export interface Education {
  id: string;
  schoolName: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  endorsements?: number;
}

export interface Recommendation {
  id: string;
  recommenderProfile: Pick<UserProfile, "id" | "uid" | "firstName" | "lastName" | "headline" | "profilePictureUrl">;
  relationship: string; 
  text: string;
  date: string; 
}

export interface Post {
  id: string;
  author: Pick<UserProfile, "id" | "uid" | "firstName" | "lastName" | "headline" | "profilePictureUrl">;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: Timestamp | string; 
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  isLikedByCurrentUser?: boolean; 
  likes: string[]; 
  comments?: Comment[]; // Array of full Comment objects
  authorId: string; 
}

export interface Comment {
  id: string;
  author: Pick<UserProfile, "id" | "uid" | "firstName" | "lastName" | "headline" | "profilePictureUrl">; // Full author details for display
  authorId: string; // Stored for querying
  content: string;
  createdAt: Timestamp | string; 
  likesCount: number;
  isLikedByCurrentUser?: boolean; // Optional: for UI indication if current user liked this comment
}

export interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship";
  description: string;
  postedDate: Timestamp | string; 
  companyLogoUrl?: string;
  skillsRequired?: string[];
  authorId: string; 
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string; 
  isRead: boolean;
}

export interface LearningCourse {
  id: string;
  title: string;
  instructor: string;
  thumbnailUrl: string;
  duration: string; 
  category: string;
  keywords?: string[]; 
}

export interface Notification {
  id: string;
  type: "connection_request" | "message" | "job_alert" | "profile_view" | "post_like" | "post_comment" | "connection_accepted";
  user?: {
    id: string; 
    name: string;
    avatarUrl?: string;
  };
  content: string;
  timestamp: Date; 
  isRead: boolean;
  link?: string;
}

export interface Invitation {
    id: string;
    fromUserId: string;
    toUserId: string;
    status: 'pending' | 'accepted' | 'ignored' | 'cancelled';
    createdAt: Timestamp | string;
    updatedAt?: Timestamp | string;
}

