

import type { Timestamp } from 'firebase/firestore';

export interface JobPreferences {
  desiredTitles?: string[];
  preferredLocations?: string[];
  openToOpportunities?: 'NotOpen' | 'Open' | 'ActivelyLooking';
}

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
  pendingInvitations?: string[]; 
  suggestedConnections?: UserProfile[]; 
  savedJobs?: string[]; 
  jobPreferences?: JobPreferences;
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
  comments?: Comment[]; 
  authorId: string; 
}

export interface Comment {
  id: string;
  author: Pick<UserProfile, "id" | "uid" | "firstName" | "lastName" | "headline" | "profilePictureUrl">; 
  authorId: string; 
  content: string;
  createdAt: Timestamp | string; 
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
  postedDate: Timestamp | string; 
  companyLogoUrl?: string;
  skillsRequired?: string[];
  authorId: string; 
  applicationsCount?: number;
  savedBy?: string[]; 
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
  type: "connection_request" | "message" | "job_alert" | "profile_view" | "post_like" | "post_comment" | "connection_accepted" | "admin_broadcast" | "job_application_received";
  recipientId?: string; 
  actorId?: string;     
  user?: {              
    id: string;
    name: string;
    avatarUrl?: string;
  };
  entityId?: string;    
  entityType?: 'post' | 'user' | 'job' | 'event' | 'message_thread'; 
  content: string; 
  timestamp: Date; 
  isRead: boolean;
  link?: string;    
}


export interface Invitation {
    id: string;
    fromUserId: string;
    toUserId: string;
    participantIds: string[];
    status: 'pending' | 'accepted' | 'ignored' | 'cancelled';
    createdAt: Timestamp | string;
    updatedAt?: Timestamp | string;
}

export interface Article {
  id: string;
  authorId: string;
  author: Pick<UserProfile, "id" | "uid" | "firstName" | "lastName" | "headline" | "profilePictureUrl">;
  title: string;
  content: string; 
  coverImageUrl?: string;
  tags?: string[];
  status: 'draft' | 'published';
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
  views?: number;
  likesCount?: number;
  commentsCount?: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: Timestamp | string; 
  location: string; 
  isOnline: boolean;
  meetingLink?: string; 
  coverImageUrl?: string;
  organizerId: string;
  organizerInfo: Pick<UserProfile, "id" | "uid" | "firstName" | "lastName" | "profilePictureUrl" | "headline">;
  category?: string; 
  tags?: string[];
  attendeesCount: number;
  attendees?: string[]; 
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string; 
  companyName: string; 
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  resumeUrl: string;
  coverLetter: string;
  appliedDate: Timestamp | string;
  status: 'submitted' | 'reviewed' | 'interviewing' | 'rejected' | 'hired' | 'withdrawn';
}

export interface AssessmentSuggestion {
    id: string;
    suggesterId: string;
    suggesterName: string; 
    title: string;
    category: "Project Management" | "Digital Marketing" | "Finance & Accounting" | "Sales & Negotiation" | "Business Communication" | "Data Analysis" | "Leadership & Management" | "Entrepreneurship" | "Human Resources" | "Customer Service" | "Other";
    description: string;
    keywords?: string[];
    exampleQuestions?: string; 
    status: 'pending_review' | 'approved' | 'rejected' | 'implemented';
    createdAt: Timestamp | string;
    reviewedAt?: Timestamp | string;
    reviewerNotes?: string;
}
