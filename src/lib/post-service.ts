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
  getDoc,
  increment,
} from 'firebase/firestore';
import type { Post, Comment } from '@/types';

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
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    } as Post;
  });
}

export async function getPostsByAuthorId(authorId: string): Promise<Post[]> {
  const postsCollectionRef = collection(db, 'posts');
  const q = query(postsCollectionRef, where('authorId', '==', authorId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
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
  commentData: Omit<Comment, 'id' | 'createdAt' | 'likesCount' | 'isLikedByCurrentUser'>
): Promise<string> {
  const commentsCollectionRef = collection(db, 'posts', postId, 'comments');
  const postRef = doc(db, 'posts', postId);
  
  const docRef = await addDoc(commentsCollectionRef, {
    ...commentData,
    createdAt: serverTimestamp(),
    likesCount: 0,
  });

  await updateDoc(postRef, {
    commentsCount: increment(1),
  });
  return docRef.id;
}

export async function getComments(postId: string): Promise<Comment[]> {
  const commentsCollectionRef = collection(db, 'posts', postId, 'comments');
  const q = query(commentsCollectionRef, orderBy('createdAt', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    } as Comment;
  });
}