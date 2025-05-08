export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  profilePictureUrl?: string;
  coverPhotoUrl?: string;
  summary?: string;
  location?: string;
  connectionsCount?: number;
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: Skill[];
  recommendations?: Recommendation[];
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
  author: Pick<UserProfile, "id" | "firstName" | "lastName" | "headline" | "profilePictureUrl">;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string; // ISO date string
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  isLikedByCurrentUser?: boolean;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  author: Pick<UserProfile, "id" | "firstName" | "lastName" | "headline" | "profilePictureUrl">;
  content: string;
  createdAt: string; // ISO date string
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
  postedDate: string; // ISO date string
  companyLogoUrl?: string;
  skillsRequired?: string[];
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
