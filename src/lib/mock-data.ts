import type { UserProfile, Post, Job, LearningCourse, Message, WorkExperience, Education, Skill, Notification } from '@/types';
import { Timestamp } from 'firebase/firestore'; 

// Helper to convert date strings to Timestamps for mock data where needed, or use ISO strings.
// For simplicity, we'll use ISO strings for createdAt in mock UserProfile as well.

export const mockUserProfiles: UserProfile[] = [
  {
    id: '1', 
    uid: 'mockuser1', 
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@example.com',
    headline: 'Senior Software Engineer at TechCorp',
    profilePictureUrl: 'https://picsum.photos/seed/alice/200/200',
    coverPhotoUrl: 'https://picsum.photos/seed/alicecover/800/200',
    summary: 'Passionate software engineer with 8+ years of experience in developing scalable web applications. Expertise in React, Node.js, and cloud technologies.',
    location: 'San Francisco, CA',
    connectionsCount: 1,
    connections: ['mockuser2'],
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
    isActive: true,
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
    connectionsCount: 1,
    connections: ['mockuser1'],
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), // 60 days ago
    isActive: false,
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
    connectionsCount: 0,
    connections: [],
    skills: [ {id: 's8', name: 'Figma', endorsements: 50}, {id: 's9', name: 'User Experience', endorsements: 65}],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    isActive: true,
  },
  {
    id: '4',
    uid: 'mockuser4',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david@example.com',
    headline: 'Data Scientist at Alpha Corp',
    profilePictureUrl: 'https://picsum.photos/seed/david/200/200',
    coverPhotoUrl: 'https://picsum.photos/seed/davidcover/800/200',
    summary: 'Expert in machine learning and data analysis.',
    location: 'San Francisco, CA', // Same location as Alice
    connectionsCount: 0,
    connections: [],
    skills: [{id: 's10', name: 'Python', endorsements: 80}, {id: 's11', name: 'Machine Learning', endorsements: 70}],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    isActive: false,
  },
  {
    id: '5',
    uid: 'mockuser5',
    firstName: 'Eve',
    lastName: 'Brown',
    email: 'eve@example.com',
    headline: 'Marketing Specialist at Beta Inc',
    profilePictureUrl: 'https://picsum.photos/seed/eve/200/200',
    coverPhotoUrl: 'https://picsum.photos/seed/evecover/800/200',
    summary: 'Digital marketing and campaign management.',
    location: 'San Francisco, CA', // Same location as Alice and David
    connectionsCount: 0,
    connections: [],
    skills: [{id: 's12', name: 'SEO', endorsements: 60}, {id: 's13', name: 'Content Marketing', endorsements: 55}],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(), // 90 days ago
    isActive: true,
  },
  {
    id: '6',
    uid: 'mockuser6',
    firstName: 'Frank',
    lastName: 'Green',
    email: 'frank@example.com',
    headline: 'DevOps Engineer at Cloud Nine',
    profilePictureUrl: 'https://picsum.photos/seed/frank/200/200',
    coverPhotoUrl: 'https://picsum.photos/seed/frankcover/800/200',
    summary: 'Automating and optimizing cloud infrastructure.',
    location: 'New York, NY', // Same location as Bob
    connectionsCount: 0,
    connections: [],
    skills: [{id: 's14', name: 'Kubernetes', endorsements: 70}, {id: 's15', name: 'Terraform', endorsements: 65}],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
    isActive: true,
  }
];


export const mockLearningCourses: LearningCourse[] = [
    { id: 'lc1', title: 'Advanced React Patterns', instructor: 'Jane Developer', thumbnailUrl: 'https://picsum.photos/seed/course1/300/170', duration: '5h 12m', category: 'Technology', keywords: ['React', 'JavaScript', 'Frontend'] },
    { id: 'lc2', title: 'Leadership Essentials', instructor: 'John Manager', thumbnailUrl: 'https://picsum.photos/seed/course2/300/170', duration: '3h 45m', category: 'Business', keywords: ['Leadership', 'Management', 'Product Management'] },
    { id: 'lc3', title: 'Data Visualization with D3.js', instructor: 'Sam Analyst', thumbnailUrl: 'https://picsum.photos/seed/course3/300/170', duration: '7h 30m', category: 'Technology', keywords: ['Data Visualization', 'D3.js', 'JavaScript', 'Data Science', 'Python'] },
    { id: 'lc4', title: 'Python for Data Science', instructor: 'Alex Data', thumbnailUrl: 'https://picsum.photos/seed/course4/300/170', duration: '10h 00m', category: 'Technology', keywords: ['Python', 'Data Science', 'Machine Learning'] },
    { id: 'lc5', title: 'Effective UX Design Principles', instructor: 'Sarah Designer', thumbnailUrl: 'https://picsum.photos/seed/course5/300/170', duration: '6h 15m', category: 'Design', keywords: ['UX Design', 'User Experience', 'Figma'] },

];

export const mockMessages: Message[] = [
    { id: 'm1', senderId: 'mockuser2', receiverId: 'mockuser1', content: 'Hey Alice, great work on that project!', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), isRead: false },
    { id: 'm2', senderId: 'mockuser1', receiverId: 'mockuser2', content: 'Thanks Bob! Appreciate it.', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), isRead: true },
    { id: 'm3', senderId: 'mockuser3', receiverId: 'mockuser1', content: 'Hi Alice, wanted to connect about UX collaboration.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isRead: false },
];


export const getProfileById = async (userId: string): Promise<UserProfile | undefined> => {
  console.warn("Using MOCK getProfileById. Should be replaced by Firestore call via getUserProfile.");
  await new Promise(resolve => setTimeout(resolve, 500)); 
  return mockUserProfiles.find(profile => profile.uid === userId || profile.id === userId); 
};

export const getCurrentUser = async (): Promise<UserProfile | undefined> => {
  console.warn("Using MOCK getCurrentUser. AuthContext should be preferred.");
  await new Promise(resolve => setTimeout(resolve, 300));
  const currentUser = mockUserProfiles.find(p => p.uid === 'mockuser1');
  return currentUser;
}

export const getLearningCourses = async (): Promise<LearningCourse[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockLearningCourses;
}

export const getMessagesWithUser = async (userId: string): Promise<Message[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const currentMockUserId = 'mockuser1'; 
  return mockMessages.filter(m => (m.senderId === userId && m.receiverId === currentMockUserId) || (m.senderId === currentMockUserId && m.receiverId === userId))
    .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); 
}

export const generateMockNotifications = (currentUserId?: string): Notification[] => {
  const notifications: Notification[] = [
    {
      id: "n1",
      type: "profile_view",
      user: { id: mockUserProfiles[1].uid, name: `${mockUserProfiles[1].firstName} ${mockUserProfiles[1].lastName}`, avatarUrl: mockUserProfiles[1].profilePictureUrl },
      content: `${mockUserProfiles[1].firstName} ${mockUserProfiles[1].lastName} viewed your profile.`,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), 
      isRead: false,
      link: `/profile/${mockUserProfiles[1].uid}`
    },
    {
      id: "n2",
      type: "post_like",
      user: { id: mockUserProfiles[2].uid, name: `${mockUserProfiles[2].firstName} ${mockUserProfiles[2].lastName}`, avatarUrl: mockUserProfiles[2].profilePictureUrl },
      content: `${mockUserProfiles[2].firstName} ${mockUserProfiles[2].lastName} liked your post: "Excited to share..."`,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), 
      isRead: true,
      link: `/posts/p1` 
    },
    {
      id: "n3",
      type: "job_alert",
      content: "New job alert: Software Engineer at Tech Innovations Inc.",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), 
      isRead: false,
      link: `/jobs/j-tech-innovations` 
    },
     {
      id: "n4",
      type: "connection_request",
      user: { id: mockUserProfiles[3].uid, name: `${mockUserProfiles[3].firstName} ${mockUserProfiles[3].lastName}`, avatarUrl: mockUserProfiles[3].profilePictureUrl },
      content: `You have a new connection request from ${mockUserProfiles[3].firstName} ${mockUserProfiles[3].lastName}.`,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), 
      isRead: true,
      link: `/network`
    },
    {
      id: "n5",
      type: "message",
      user: { id: mockUserProfiles[2].uid, name: `${mockUserProfiles[2].firstName} ${mockUserProfiles[2].lastName}`, avatarUrl: mockUserProfiles[2].profilePictureUrl },
      content: `${mockUserProfiles[2].firstName} sent you a new message.`,
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isRead: false,
      link: `/messaging?chatWith=${mockUserProfiles[2].uid}`
    },
  ];
  // Filter out notifications where the acting user is the current user (e.g., can't get a profile view notification from self)
  if (currentUserId) {
    return notifications.filter(n => !n.user || n.user.id !== currentUserId);
  }
  return notifications;
};
