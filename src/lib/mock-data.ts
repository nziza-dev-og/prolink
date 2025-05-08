import type { UserProfile, Post, Job, LearningCourse, Message, WorkExperience, Education, Skill } from '@/types';

export const mockUserProfiles: UserProfile[] = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Johnson',
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
  },
  {
    id: '2',
    firstName: 'Bob',
    lastName: 'Smith',
    headline: 'Product Manager at NextGen Products',
    profilePictureUrl: 'https://picsum.photos/seed/bob/200/200',
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
  },
  {
    id: '3',
    firstName: 'Carol',
    lastName: 'Davis',
    headline: 'UX Designer at CreativeWorks Studio',
    profilePictureUrl: 'https://picsum.photos/seed/carol/200/200',
    summary: 'Creating intuitive and engaging user experiences. Proficient in Figma, Sketch, and Adobe XD.',
    location: 'Austin, TX',
    connectionsCount: 410,
  },
];

export const mockPosts: Post[] = [
  {
    id: 'p1',
    author: mockUserProfiles[0],
    content: 'Excited to share that I just launched a new open-source project! Check it out on GitHub. #opensource #javascript #react',
    imageUrl: 'https://picsum.photos/seed/post1/600/400',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    likesCount: 152,
    commentsCount: 12,
    repostsCount: 5,
    isLikedByCurrentUser: true,
    comments: [
        { id: 'c1', author: mockUserProfiles[1], content: 'This looks great, Alice!', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), likesCount: 5, isLikedByCurrentUser: false},
        { id: 'c2', author: mockUserProfiles[2], content: 'Awesome work!', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), likesCount: 3, isLikedByCurrentUser: true},
    ]
  },
  {
    id: 'p2',
    author: mockUserProfiles[1],
    content: 'Just attended an insightful webinar on the future of AI in product management. So many interesting takeaways! #AI #productmanagement #tech',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    likesCount: 88,
    commentsCount: 7,
    repostsCount: 2,
    isLikedByCurrentUser: false,
  },
  {
    id: 'p3',
    author: mockUserProfiles[2],
    content: 'Thrilled to be speaking at the upcoming UX Design Conference! My talk will be on "Designing for Accessibility". Hope to see you there! #UX #Design #Accessibility',
    imageUrl: 'https://picsum.photos/seed/post3/600/300',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    likesCount: 230,
    commentsCount: 25,
    repostsCount: 15,
  },
];

export const mockJobs: Job[] = [
  {
    id: 'j1',
    title: 'Frontend Developer',
    companyName: 'WebSolutions Inc.',
    location: 'Remote',
    employmentType: 'Full-time',
    description: 'Seeking a skilled Frontend Developer to build responsive and user-friendly web interfaces. Experience with React and Tailwind CSS is a plus.',
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    companyLogoUrl: 'https://picsum.photos/seed/websol/50/50',
    skillsRequired: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
  },
  {
    id: 'j2',
    title: 'Data Scientist',
    companyName: 'Alpha Analytics',
    location: 'Boston, MA',
    employmentType: 'Full-time',
    description: 'Join our team to analyze large datasets, build predictive models, and derive actionable insights. Python and SQL proficiency required.',
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    companyLogoUrl: 'https://picsum.photos/seed/alpha/50/50',
    skillsRequired: ['Python', 'SQL', 'Machine Learning', 'Statistics'],
  },
];

export const mockLearningCourses: LearningCourse[] = [
    { id: 'lc1', title: 'Advanced React Patterns', instructor: 'Jane Developer', thumbnailUrl: 'https://picsum.photos/seed/course1/300/170', duration: '5h 12m', category: 'Technology' },
    { id: 'lc2', title: 'Leadership Essentials', instructor: 'John Manager', thumbnailUrl: 'https://picsum.photos/seed/course2/300/170', duration: '3h 45m', category: 'Business' },
    { id: 'lc3', title: 'Data Visualization with D3.js', instructor: 'Sam Analyst', thumbnailUrl: 'https://picsum.photos/seed/course3/300/170', duration: '7h 30m', category: 'Technology' },
];

export const mockMessages: Message[] = [
    { id: 'm1', senderId: '2', receiverId: '1', content: 'Hey Alice, great work on that project!', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), isRead: false },
    { id: 'm2', senderId: '1', receiverId: '2', content: 'Thanks Bob! Appreciate it.', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), isRead: true },
];

// Simulate API calls
export const getProfileById = async (userId: string): Promise<UserProfile | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return mockUserProfiles.find(profile => profile.id === userId);
};

export const getCurrentUser = async (): Promise<UserProfile | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockUserProfiles[0]; // Assuming Alice is the current user
}

export const getFeedPosts = async (): Promise<Post[]> => {
  await new Promise(resolve => setTimeout(resolve, 700));
  return mockPosts;
};

export const getJobs = async (): Promise<Job[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockJobs;
}

export const getLearningCourses = async (): Promise<LearningCourse[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockLearningCourses;
}

export const getMessagesWithUser = async (userId: string): Promise<Message[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockMessages.filter(m => (m.senderId === userId && m.receiverId === '1') || (m.senderId === '1' && m.receiverId === userId));
}
