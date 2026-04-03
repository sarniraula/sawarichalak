import type { CountryKey, LicenseType } from '@/types/content';
import type { UserProfile } from '@/types/profile';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const USER_DOC_PREFIX = 'users'; // users/{uid}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, USER_DOC_PREFIX, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  if (!data) return null;

  return {
    id: data.id ?? uid,
    email: data.email,
    country: data.country,
    licenseType: data.licenseType,
    createdAt: data.createdAt,
  };
}

export async function createUserProfile(params: {
  uid: string;
  email: string;
  country: CountryKey;
  licenseType: LicenseType;
}): Promise<void> {
  const ref = doc(db, USER_DOC_PREFIX, params.uid);

  const profile: UserProfile = {
    id: params.uid,
    email: params.email,
    country: params.country,
    licenseType: params.licenseType,
    createdAt: new Date().toISOString(),
  };

  await setDoc(ref, profile, { merge: true });
}

export async function updateUserProfile(params: {
  uid: string;
  country: CountryKey;
  licenseType: LicenseType;
}): Promise<void> {
  const ref = doc(db, USER_DOC_PREFIX, params.uid);
  await setDoc(
    ref,
    {
      country: params.country,
      licenseType: params.licenseType,
    } as Partial<UserProfile>,
    { merge: true },
  );
}

