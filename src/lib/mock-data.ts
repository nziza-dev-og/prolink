import type { UserProfile, Post, Job, LearningCourse, Message, WorkExperience, Education, Skill } from '@/types';
import { Timestamp } from 'firebase/firestore'; 

// Helper to convert date strings to Timestamps for mock data where needed, or use ISO strings.
// For simplicity, we'll use ISO strings for createdAt in mock UserProfile as well.

export const mockUserProfiles: UserProfile[] = [
  {
    id: '1', // Kept for potential legacy use in mocks, UID is primary identifier
    uid: 'mockuser1', 
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@example.com',
    headline: 'Senior Software Engineer at TechCorp',
    profilePictureUrl: 'https://picsum.photos/seed/alice/200/200',
    coverPhotoUrl: 'https://picsum.photos/seed/alicecover/800/200',
    summary: 'Passionate software engineer with 8+ years of experience in developing scalable web applications. Expertise in React, Node.js, and cloud technologies.',
    location: 'San Francisco, CA',
    connectionsCount: 500,
    workExperience: [
      { id: 'we1', title: 'Senior Software Engineer', companyName: 'TechCorp', startDate: 'Jan 2020', endDate: 'Present', description: 'Led development of key features for the flagship product.' , companyLogoUrl: 'https://picsum.photos/seed/techcorp/50/50' },
      { id: 'we2', title: 'Software Engineer', companyName: 'Innovate Solutions', startDate: 'Jun 2017', endDate: 'Dec 2019', description: 'Contributed to various client projects using modern web technologies.', companyLogoUrl: 'https://picsum.photos/seed/innovate/50/50' },
    ],
    education: [
      { id: 'edu1', schoolName: 'Stanford University', degree: 'M.S. in Computer Science', startDate: '2015', endDate: '2017' },
      { id: 'edu2', schoolName: 'University of California, Berkeley', degree: 'B.S. in Electrical Engineering and Computer Sciences', startDate: '2011', endDate: '2015' },
    ],
    skills: [
      { id: 's1', name: 'React', endorsements: 99 },
      { id: 's2', name: 'Node.js', endorsements: 85 },
      { id: 's3', name: 'JavaScript', endorsements: 120 },
      { id: 's4', name: 'TypeScript', endorsements: 70 },
      { id: 's5', name: 'AWS', endorsements: 60 },
    ],
    createdAt: new Date().toISOString(), 
  },
  {
    id: '2',
    uid: 'mockuser2',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob@example.com',
    headline: 'Product Manager at NextGen Products',
    profilePictureUrl: 'https://picsum.photos/seed/bob/200/200',
    coverPhotoUrl: 'https://picsum.photos/seed/bobcover/800/200',
    summary: 'Driving product strategy and execution for innovative SaaS solutions. Strong believer in user-centric design.',
    location: 'New York, NY',
    connectionsCount: 342,
     workExperience: [
      { id: 'we3', title: 'Product Manager', companyName: 'NextGen Products', startDate: 'Mar 2019', endDate: 'Present', description: 'Defining product roadmap and working with cross-functional teams.', companyLogoUrl: 'https://picsum.photos/seed/nextgen/50/50' },
    ],
    education: [
      { id: 'edu3', schoolName: 'Columbia University', degree: 'MBA', startDate: '2017', endDate: '2019' },
    ],
    skills: [
      { id: 's6', name: 'Product Management', endorsements: 90 },
      { id: 's7', name: 'Agile Methodologies', endorsements: 75 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    uid: 'mockuser3',
    firstName: 'Carol',
    lastName: 'Davis',
    email: 'carol@example.com',
    headline: 'UX Designer at CreativeWorks Studio',
    profilePictureUrl: 'https://picsum.photos/seed/carol/200/200',
    coverPhotoUrl: 'https://picsum.photos/seed/carolcover/800/200',
    summary: 'Creating intuitive and engaging user experiences. Proficient in Figma, Sketch, and Adobe XD.',
    location: 'Austin, TX',
    connectionsCount: 410,
    createdAt: new Date().toISOString(),
  },
];


export const mockLearningCourses: LearningCourse[] = [
    { id: 'lc1', title: 'Advanced React Patterns', instructor: 'Jane Developer', thumbnailUrl: 'https://picsum.photos/seed/course1/300/170', duration: '5h 12m', category: 'Technology' },
    { id: 'lc2', title: 'Leadership Essentials', instructor: 'John Manager', thumbnailUrl: 'https://picsum.photos/seed/course2/300/170', duration: '3h 45m', category: 'Business' },
    { id: 'lc3', title: 'Data Visualization with D3.js', instructor: 'Sam Analyst', thumbnailUrl: 'https://picsum.photos/seed/course3/300/170', duration: '7h 30m', category: 'Technology' },
];

export const mockMessages: Message[] = [
    { id: 'm1', senderId: 'mockuser2', receiverId: 'mockuser1', content: 'Hey Alice, great work on that project!', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), isRead: false },
    { id: 'm2', senderId: 'mockuser1', receiverId: 'mockuser2', content: 'Thanks Bob! Appreciate it.', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), isRead: true },
];


export const getProfileById = async (userId: string): Promise<UserProfile | undefined> => {
  console.warn("Using MOCK getProfileById. Should be replaced by Firestore call via getUserProfile.");
  await new Promise(resolve => setTimeout(resolve, 500)); 
  return mockUserProfiles.find(profile => profile.uid === userId || profile.id === userId); // Check uid first
};

export const getCurrentUser = async (): Promise<UserProfile | undefined> => {
  console.warn("Using MOCK getCurrentUser. AuthContext should be preferred.");
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockUserProfiles[0]; 
}

export const getLearningCourses = async (): Promise<LearningCourse[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockLearningCourses;
}

export const getMessagesWithUser = async (userId: string): Promise<Message[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const currentMockUserId = 'mockuser1'; 
  return mockMessages.filter(m => (m.senderId === userId && m.receiverId === currentMockUserId) || (m.senderId === currentMockUserId && m.receiverId === userId));
}