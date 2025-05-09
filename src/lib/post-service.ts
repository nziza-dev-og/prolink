
'use server';

import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  where,
  increment,
  writeBatch,
} from 'firebase/firestore';
import type { Post, Comment, UserProfile } from '@/types';
import { getUserProfile } from './user-service'; 

export async function createPost(
  postData: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'repostsCount' | 'likes' | 'comments'>
): Promise<string> {
  const postsCollectionRef = collection(db, 'posts');
  const docRef = await addDoc(postsCollectionRef, {
    ...postData,
    createdAt: serverTimestamp(),
    likesCount: 0,
    commentsCount: 0,
    repostsCount: 0,
    likes: [],
  });
  return docRef.id;
}

export async function getPosts(): Promise<Post[]> {
  const postsCollectionRef = collection(db, 'posts');
  const q = query(postsCollectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  const postsWithAuthors = await Promise.all(
    querySnapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data();
      let authorInfo: Pick<UserProfile, "id" | "uid" | "firstName" | "lastName" | "headline" | "profilePictureUrl"> = {
        id: data.authorId, 
        uid: data.authorId,
        firstName: 'Unknown',
        lastName: 'User',
        headline: 'ProLink User',
        profilePictureUrl: undefined,
      };

      if (data.authorId) {
        const authorProfile = await getUserProfile(data.authorId);
        if (authorProfile) {
          authorInfo = {
            id: authorProfile.uid, 
            uid: authorProfile.uid,
            firstName: authorProfile.firstName,
            lastName: authorProfile.lastName,
            headline: authorProfile.headline,
            profilePictureUrl: authorProfile.profilePictureUrl,
          };
        }
      }

      return {
        ...data,
        id: docSnapshot.id,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : String(data.createdAt),
        author: authorInfo,
        likes: data.likes || [],
        likesCount: data.likesCount || 0,
        commentsCount: data.commentsCount || 0,
        repostsCount: data.repostsCount || 0,
      } as Post;
    })
  );
  return postsWithAuthors;
}

export async function getPostsByAuthorId(authorId: string): Promise<Post[]> {
  const postsCollectionRef = collection(db, 'posts');
  const q = query(postsCollectionRef, where('authorId', '==', authorId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  const authorProfile = await getUserProfile(authorId);
  let authorInfo: Pick<UserProfile, "id" | "uid" | "firstName" | "lastName" | "headline" | "profilePictureUrl">;

  if (authorProfile) {
    authorInfo = {
      id: authorProfile.uid,
      uid: authorProfile.uid,
      firstName: authorProfile.firstName,
      lastName: authorProfile.lastName,
      headline: authorProfile.headline,
      profilePictureUrl: authorProfile.profilePictureUrl,
    };
  } else {
    authorInfo = { 
      id: authorId,
      uid: authorId,
      firstName: 'Unknown',
      lastName: 'User',
      headline: 'ProLink User',
      profilePictureUrl: undefined,
    };
  }

  return querySnapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      ...data,
      id: docSnapshot.id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : String(data.createdAt),
      author: authorInfo,
      likes: data.likes || [],
      likesCount: data.likesCount || 0,
      commentsCount: data.commentsCount || 0,
      repostsCount: data.repostsCount || 0,
    } as Post;
  });
}


export async function likePost(postId: string, userId: string): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    likes: arrayUnion(userId),
    likesCount: increment(1),
  });
}

export async function unlikePost(postId: string, userId: string): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    likes: arrayRemove(userId),
    likesCount: increment(-1),
  });
}

export async function addComment(
  postId: string,
  commentData: Omit<Comment, 'id' | 'createdAt' | 'author' | 'likesCount' | 'isLikedByCurrentUser'>
): Promise<string> {
  const commentsCollectionRef = collection(db, 'posts', postId, 'comments');
  const postRef = doc(db, 'posts', postId);
  
  const batch = writeBatch(db);

  const newCommentRef = doc(commentsCollectionRef); // Generate new doc ref for comment
  batch.set(newCommentRef, {
    ...commentData,
    createdAt: serverTimestamp(),
    likesCount: 0,
  });

  batch.update(postRef, {
    commentsCount: increment(1),
  });

  await batch.commit();
  return newCommentRef.id;
}

export async function getComments(postId: string): Promise<Comment[]> {
  const commentsCollectionRef = collection(db, 'posts', postId, 'comments');
  const q = query(commentsCollectionRef, orderBy('createdAt', 'asc')); // Fetch newest last for typical display
  const querySnapshot = await getDocs(q);
  
  const commentsWithAuthors = await Promise.all(
    querySnapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data();
      let authorInfo: Pick<UserProfile, "id" | "uid" | "firstName" | "lastName" | "headline" | "profilePictureUrl"> = {
        id: data.authorId,
        uid: data.authorId,
        firstName: 'Unknown',
        lastName: 'User',
        headline: 'ProLink User',
        profilePictureUrl: undefined,
      };

      if (data.authorId) {
        const authorProfile = await getUserProfile(data.authorId);
        if (authorProfile) {
          authorInfo = {
            id: authorProfile.uid,
            uid: authorProfile.uid,
            firstName: authorProfile.firstName,
            lastName: authorProfile.lastName,
            headline: authorProfile.headline,
            profilePictureUrl: authorProfile.profilePictureUrl,
          };
        }
      }
      
      return {
        ...data,
        id: docSnapshot.id,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : String(data.createdAt),
        author: authorInfo, // Ensure author object has uid
      } as Comment;
    })
  );
  return commentsWithAuthors;
}

export async function repostPost(postId: string, userId: string): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  // For simplicity, we just increment a counter.
  // A more complex system might create a new post referencing the original or add to a `repostedBy` array.
  await updateDoc(postRef, {
    repostsCount: increment(1),
    // Optionally, track who reposted if needed for other features:
    // repostedBy: arrayUnion(userId) 
  });

  // If you want to create a new post for the repost:
  // const originalPostSnap = await getDoc(postRef);
  // if (originalPostSnap.exists()) {
  //   const originalPostData = originalPostSnap.data();
  //   await createPost({
  //     authorId: userId, // The user who is reposting
  //     content: `Reposted: ${originalPostData.content}`, // Or some other indicator
  //     originalPostId: postId, // Link to the original post
  //     // ... other fields like imageUrl might be copied or handled differently
  //   });
  // }
}

export async function getTotalPostsCount(): Promise<number> {
  const postsCollectionRef = collection(db, 'posts');
  const querySnapshot = await getDocs(postsCollectionRef);
  return querySnapshot.size;
}

