
'use server';

import { db } from './firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import type { Article, UserProfile } from '@/types';
import { getUserProfile } from './user-service';

export async function createArticle(
  articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'author' | 'views' | 'likesCount' | 'commentsCount'>
): Promise<string> {
  const articlesCollectionRef = collection(db, 'articles');
  
  const authorProfile = await getUserProfile(articleData.authorId);
  if (!authorProfile) {
    throw new Error('Author profile not found.');
  }

  const authorInfo: Pick<UserProfile, "id" | "uid" | "firstName" | "lastName" | "headline" | "profilePictureUrl"> = {
    id: authorProfile.uid,
    uid: authorProfile.uid,
    firstName: authorProfile.firstName,
    lastName: authorProfile.lastName,
    headline: authorProfile.headline,
    profilePictureUrl: authorProfile.profilePictureUrl,
  };

  const docRef = await addDoc(articlesCollectionRef, {
    ...articleData,
    author: authorInfo,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    views: 0,
    likesCount: 0,
    commentsCount: 0,
  });
  return docRef.id;
}

export async function getArticleById(articleId: string): Promise<Article | null> {
  const articleRef = doc(db, 'articles', articleId);
  const docSnap = await getDoc(articleRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : String(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : String(data.updatedAt),
    } as Article;
  } else {
    return null;
  }
}

export async function updateArticle(articleId: string, data: Partial<Omit<Article, 'id' | 'authorId' | 'author' | 'createdAt'>>): Promise<void> {
  const articleRef = doc(db, 'articles', articleId);
  await updateDoc(articleRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteArticle(articleId: string): Promise<void> {
  const articleRef = doc(db, 'articles', articleId);
  await deleteDoc(articleRef);
}

export async function getArticlesByAuthor(authorId: string): Promise<Article[]> {
  const articlesCollectionRef = collection(db, 'articles');
  const q = query(articlesCollectionRef, where('authorId', '==', authorId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : String(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : String(data.updatedAt),
    } as Article;
  });
}

export async function getAllArticles(): Promise<Article[]> {
  const articlesCollectionRef = collection(db, 'articles');
  const q = query(articlesCollectionRef, where('status', '==', 'published'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : String(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : String(data.updatedAt),
    } as Article;
  });
}
