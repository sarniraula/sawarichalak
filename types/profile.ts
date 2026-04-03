import type { CountryKey, LicenseType } from './content';

export type UserProfile = {
  id: string; // uid
  email: string;
  country: CountryKey;
  licenseType: LicenseType;
  createdAt: string; // ISO string (client side)
};

