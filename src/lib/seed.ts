import type { AppData, StudentProfile, User } from './types';
import { SEED_RESIDENTS } from './residents';
import { emptyWeek, week } from './time';

/** Lightweight, non-cryptographic hash so demo passwords aren't stored as plain text. Not real security. */
export function demoHash(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export const DEMO_PASSWORD = 'demo1234';
export const DATA_VERSION = 6;

const PM = { start: '13:00', end: '17:00' };
const AM = { start: '09:00', end: '12:00' };
const EVE = { start: '17:30', end: '20:00' };

/** Fictional student volunteers that families can browse and invite. */
const FICTIONAL_VOLUNTEERS: {
  key: string; fullName: string; dob: string; university: string; program: string; year: string;
  languages: StudentProfile['languages']; interests: string[]; personality: string[];
  availability: StudentProfile['availability']; visitsPerWeek: number; duration: number;
}[] = [
  { key: 'amara', fullName: 'Amara Okoye', dob: '2003-09-12', university: 'University of Alberta', program: 'Psychology', year: '3rd Year',
    languages: [{ language: 'English', fluency: 'Fluent' }, { language: 'French', fluency: 'Conversational' }],
    interests: ['Music', 'Singing', 'Reading', 'Baking', 'Movies', 'Storytelling', 'Gardening', 'Card Games', 'Walking'],
    personality: ['Warm', 'Talkative', 'Funny / Playful', 'Empathetic'], availability: week({ 1: [PM], 3: [PM], 5: [AM, PM] }), visitsPerWeek: 2, duration: 60 },
  { key: 'liam', fullName: 'Liam Tremblay', dob: '2004-02-03', university: 'MacEwan University', program: 'Social Work', year: '2nd Year',
    languages: [{ language: 'English', fluency: 'Fluent' }, { language: 'French', fluency: 'Fluent' }],
    interests: ['Sports', 'History', 'Card Games', 'Board Games', 'Walking', 'Television', 'Music', 'Chess', 'Movies'],
    personality: ['Calm', 'Patient', 'Good Listener', 'Funny / Playful'], availability: week({ 0: [AM], 2: [AM, PM], 4: [PM] }), visitsPerWeek: 2, duration: 60 },
  { key: 'sofia', fullName: 'Sofia Martinez', dob: '2002-11-27', university: 'University of Alberta', program: 'Nursing', year: '4th Year',
    languages: [{ language: 'English', fluency: 'Fluent' }, { language: 'Spanish', fluency: 'Fluent' }],
    interests: ['Dancing', 'Cooking', 'Music', 'Singing', 'Baking', 'Community Events', 'Gardening', 'Movies', 'Storytelling'],
    personality: ['Outgoing', 'Vibrant / Energetic', 'Warm', 'Funny / Playful'], availability: week({ 1: [PM, EVE], 3: [PM], 5: [PM], 6: [PM] }), visitsPerWeek: 2, duration: 90 },
  { key: 'ethan', fullName: 'Ethan Chen', dob: '2005-04-18', university: 'University of Alberta', program: 'Computing Science', year: '2nd Year',
    languages: [{ language: 'English', fluency: 'Fluent' }, { language: 'Mandarin', fluency: 'Fluent' }, { language: 'Cantonese', fluency: 'Conversational' }],
    interests: ['Technology', 'Puzzles', 'Chess', 'Painting', 'Drawing', 'Photography', 'Music', 'Reading', 'Nature'],
    personality: ['Quiet', 'Patient', 'Gentle', 'Creative'], availability: week({ 0: [PM], 2: [PM], 3: [AM], 5: [AM] }), visitsPerWeek: 1, duration: 45 },
  { key: 'noor', fullName: 'Noor Rahman', dob: '2003-06-30', university: 'NAIT', program: 'Practical Nursing', year: '1st Year',
    languages: [{ language: 'English', fluency: 'Fluent' }, { language: 'Arabic', fluency: 'Fluent' }, { language: 'Punjabi', fluency: 'Basic' }],
    interests: ['Gardening', 'Board Games', 'Reading', 'Cooking', 'Travel', 'Walking', 'Storytelling', 'History', 'Baking'],
    personality: ['Calm', 'Empathetic', 'Good Listener', 'Gentle'], availability: week({ 1: [AM], 3: [AM, PM], 5: [AM] }), visitsPerWeek: 2, duration: 60 },
  { key: 'jordan', fullName: 'Jordan Bennett', dob: '2004-08-09', university: 'Concordia University of Edmonton', program: 'Music', year: '3rd Year',
    languages: [{ language: 'English', fluency: 'Fluent' }],
    interests: ['Playing Instruments', 'Music', 'Singing', 'Reading', 'History', 'Knitting', 'Movies', 'Puzzles', 'Crafts'],
    personality: ['Gentle', 'Calm', 'Creative', 'Good Listener'], availability: week({ 0: [AM], 1: [AM], 3: [PM], 4: [PM] }), visitsPerWeek: 2, duration: 45 },
];


export function blankStudent(userId: string, email: string): StudentProfile {
  return {
    userId,
    step: 0,
    vscFileName: '',
    vscSubmittedAt: null,
    trainingCompletedAt: null,
    fullName: '',
    email,
    phone: '',
    dob: '',
    university: '',
    program: '',
    yearOfStudy: '',
    photo: null,
    languages: [],
    otherLanguage: '',
    interests: [],
    customInterests: [],
    personality: [],
    otherPersonality: '',
    availability: emptyWeek(),
    visitsPerWeek: 2,
    visitDuration: 60,
    preferredArea: '',
    termsAcceptedAt: null,
  };
}

export function createSeedData(): AppData {
  const now = new Date();
  const created = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 12).toISOString();

  // No premade sign-in accounts: only browsable volunteer profiles.
  const users: User[] = [];

  const volunteers = FICTIONAL_VOLUNTEERS.map((v) => {
    const id = `user-${v.key}`;
    users.push({ id, email: `${v.key}@volunteer.familiarfaces.ca`, passwordHash: demoHash(DEMO_PASSWORD), role: 'student', displayName: v.fullName, onboarded: true, createdAt: created, isSimulated: true });
    const profile: StudentProfile = {
      ...blankStudent(id, `${v.key}@volunteer.familiarfaces.ca`),
      step: 5, vscFileName: 'vsc.pdf', vscSubmittedAt: created, trainingCompletedAt: created, termsAcceptedAt: created,
      fullName: v.fullName, phone: '(780) 555-0100', dob: v.dob, university: v.university, program: v.program, yearOfStudy: v.year,
      languages: v.languages, interests: v.interests, personality: v.personality, availability: v.availability, visitsPerWeek: v.visitsPerWeek, visitDuration: v.duration, preferredArea: 'Any',
    };
    return [id, profile] as const;
  });

  return {
    version: DATA_VERSION,
    users,
    students: Object.fromEntries(volunteers),
    residents: SEED_RESIDENTS.map((r) => ({ ...r })),
    requests: [],
    commitments: [],
    visits: [],
    tickets: [],
    journal: [],
    sessionUserId: null,
  };
}
