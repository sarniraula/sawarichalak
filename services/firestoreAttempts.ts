import type { Attempt } from '@/types/attempt';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';

export async function upsertAttemptHistory(attempt: Attempt): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  if (attempt.userId !== currentUser.uid) {
    // If the attempt was created offline, avoid writing wrong ownership.
    return;
  }

  const ref = doc(db, 'users', currentUser.uid, 'attempts', attempt.id);
  await setDoc(ref, attempt as any, { merge: true });
}

export async function fetchAttemptHistory(userId: string): Promise<Attempt[]> {
  const snap = await getDocs(collection(db, 'users', userId, 'attempts'));
  const attempts: Attempt[] = snap.docs.map((d) => d.data() as Attempt);
  // Sort newest first.
  return attempts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

