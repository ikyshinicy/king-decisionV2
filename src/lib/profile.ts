'use client';

export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  fullName: string;
  username: string;
  gender: Gender;
  email?: string;
  phone?: string;
  customTitle?: string;
}

const PROFILE_KEY = 'king_decision_profile';

export const ROYAL_TITLES_MALE = [
  'Paduka Raja',
  'Yang Mulia Raja',
  'Baginda Raja',
  'Sri Baginda',
  'Tuanku',
  'Gusti',
  'Kanjeng',
  'Sinuhun',
];

export const ROYAL_TITLES_FEMALE = [
  'Paduka Ratu',
  'Yang Mulia Ratu',
  'Baginda Ratu',
  'Sri Ratu',
  'Tuanku',
  'Gusti Ratu',
  'Kanjeng Ratu',
];

export const ROYAL_TITLES_OTHER = [
  'Yang Mulia',
  'Tuanku',
  'Sri Paduka',
  'Gusti',
];

export function getTitlesForGender(gender: Gender): string[] {
  if (gender === 'male') return ROYAL_TITLES_MALE;
  if (gender === 'female') return ROYAL_TITLES_FEMALE;
  return ROYAL_TITLES_OTHER;
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }
}

export function loadProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function getKingTitle(profile: UserProfile | null): string {
  if (!profile) return 'Yang Mulia Raja';
  const { fullName, username, gender, customTitle } = profile;
  const displayName = fullName || username || 'Tuan';
  const title = customTitle || (gender === 'male' ? 'Yang Mulia Raja' : gender === 'female' ? 'Yang Mulia Ratu' : 'Yang Mulia');
  return `${title} ${displayName}`;
}

export function getAIGreeting(profile: UserProfile | null): string {
  if (!profile) return 'Tuanku';
  const { fullName, username, gender, customTitle } = profile;
  const displayName = fullName || username || 'Tuanku';
  const title = customTitle || (gender === 'male' ? 'Paduka Raja' : gender === 'female' ? 'Paduka Ratu' : 'Yang Mulia');
  return `${title} ${displayName}`;
}

export function getShortGreeting(profile: UserProfile | null): string {
  if (!profile) return 'Tuanku';
  const { gender, customTitle } = profile;
  if (customTitle) return customTitle;
  if (gender === 'male') return 'Paduka Raja';
  if (gender === 'female') return 'Paduka Ratu';
  return 'Yang Mulia';
}
