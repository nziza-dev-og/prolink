import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string; // This will typically be the Firebase UID
  uid: string; // Firebase UID
  firstName: string;
  lastName: string;
  email: string;
  headline?: string;
  profilePictureUrl?: string;
  coverPhotoUrl?: string;
  summary?: string;
  location?: string;
  connectionsCount?: number;
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: Skill[];
  recommendations?: Recommendation[];
  createdAt: Timestamp | string; // Firestore Timestamp or ISO string
  updatedAt?: Timestamp | string; // Optional: Firestore Timestamp or ISO string for last update
}

export interface WorkExperience {
  id: string;
  title: string;
  companyName: string;
  location?: string;
  startDate: string; // Could be Date object or string
  endDate?: string; // Could be Date object or string, or "Present"
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
  recommenderProfile: Pick<UserProfile, "id" | "firstName" | "lastName" | "headline" | "profilePictureUrl">;
  relationship: string; // e.g., "Managed John directly at Google"
  text: string;
  date: string; // Could be Date object or string
}

export interface Post {
  id: string;
  author: Pick<UserProfile, "id" | "uid" | "firstName" | "lastName" | "headline" | "profilePictureUrl">;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: Timestamp | string; // Firestore Timestamp or ISO string
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  isLikedByCurrentUser?: boolean; // This will be determined client-side based on 'likes' array
  likes: string[]; // Array of user UIDs who liked the post
  comments?: Comment[];
  authorId: string; // Firebase UID of the author
}

export interface Comment {
  id: string;
  author: Pick<UserProfile, "id" | "uid" | "firstName" | "lastName" | "headline" | "profilePictureUrl">;
  authorId: string;
  content: string;
  createdAt: Timestamp | string; // Firestore Timestamp or ISO string
  likesCount: number;
  isLikedByCurrentUser?: boolean;
}

export interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship";
  description: string;
  postedDate: Timestamp | string; // Firestore Timestamp or ISO string
  companyLogoUrl?: string;
  skillsRequired?: string[];
  authorId: string; // Firebase UID of the user who posted the job
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string; // ISO date string
  isRead: boolean;
}

export interface LearningCourse {
  id: string;
  title: string;
  instructor: string;
  thumbnailUrl: string;
  duration: string; // e.g. "2h 30m"
  category: string;
}