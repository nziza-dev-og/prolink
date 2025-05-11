
'use server';

import { db } from './firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { AssessmentSuggestion } from '@/types';

export async function createAssessmentSuggestion(
  suggestionData: Omit<AssessmentSuggestion, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  const suggestionsCollectionRef = collection(db, 'assessmentSuggestions');
  
  const docRef = await addDoc(suggestionsCollectionRef, {
    ...suggestionData,
    status: 'pending_review', // Initial status
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Future functions might include:
// - getAssessmentSuggestionById(id: string)
// - getAllAssessmentSuggestions(statusFilter?: AssessmentSuggestion['status'])
// - updateAssessmentSuggestionStatus(id: string, status: AssessmentSuggestion['status'])
