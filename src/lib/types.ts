export type Role = 'student' | 'family';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role | null;
  displayName: string;
  onboarded: boolean;
  createdAt: string;
  isDemo?: boolean;
  /** Fictional volunteer used to populate Find a Volunteer; nobody signs in as them. */
  isSimulated?: boolean;
}

export interface TimeWindow {
  start: string; // "HH:MM"
  end: string;
}

export interface DayAvailability {
  available: boolean;
  windows: TimeWindow[];
}

/** Index 0 = Monday … 6 = Sunday */
export type WeeklyAvailability = DayAvailability[];

export type Fluency = 'Basic' | 'Conversational' | 'Fluent';

export interface LanguageSkill {
  language: string;
  fluency: Fluency;
}

export interface StudentProfile {
  userId: string;
  step: number;
  vscFileName: string;
  vscSubmittedAt: string | null;
  trainingCompletedAt: string | null;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  university: string;
  program: string;
  yearOfStudy: string;
  photo: string | null;
  languages: LanguageSkill[];
  otherLanguage: string;
  interests: string[];
  customInterests: string[];
  personality: string[];
  otherPersonality: string;
  availability: WeeklyAvailability;
  visitsPerWeek: number;
  visitDuration: number; // minutes
  preferredArea: string;
  termsAcceptedAt: string | null;
}

export interface Resident {
  id: string;
  familyUserId: string | null;
  fullName: string;
  preferredName: string;
  age: number;
  dob: string;
  careHome: string;
  neighbourhood: string;
  photo: string | null;
  bio: string;
  languages: string[];
  otherLanguage: string;
  interests: string[];
  customInterests: string[];
  personality: string[];
  preferredTraits: string[];
  otherTrait: string;
  communication: string[];
  otherCommunication: string;
  spokenTo: string;
  mobility: string[];
  otherMobility: string;
  topicsToAvoid: string[];
  otherTopic: string;
  privateNotes: string;
  favouriteMusic: string;
  favouriteActivities: string;
  favouriteTopics: string;
  visitDuration: number;
  availability: WeeklyAvailability;
  preferredTimesNote: string;
  sensory: string;
  additional: string;
  family: {
    name: string;
    relationship: string;
    email: string;
    phone: string;
  };
}

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

export interface CompanionRequest {
  id: string;
  studentId: string;
  residentId: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  decidedAt: string | null;
  decisionNote: string;
  /** Who started it: a student requesting a resident, or a family inviting a volunteer. */
  from?: 'student' | 'family';
}

export interface Commitment {
  id: string;
  studentId: string;
  residentId: string;
  matchedAt: string;
  weeklyGoal: number;
  active: boolean;
  endedAt: string | null;
}

export type VisitStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'disputed';

export interface Visit {
  id: string;
  commitmentId: string;
  studentId: string;
  residentId: string;
  scheduledStart: string; // ISO
  plannedMinutes: number;
  status: VisitStatus;
  checkInAt: string | null;
  checkOutAt: string | null;
  minutes: number;
  approval: ApprovalStatus | null;
  familyNote: string;
  studentNote: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  category: string;
  message: string;
  createdAt: string;
  reference: string;
}

export type Mood = 'Joyful' | 'Chatty' | 'Calm' | 'Tired' | 'Unsettled';

/** A student's note after spending time with their companion. Shared with the family. */
export interface JournalEntry {
  id: string;
  commitmentId: string;
  studentId: string;
  residentId: string;
  visitId: string | null;
  createdAt: string;
  talkedAbout: string;
  enjoyed: string;
  mood: Mood | null;
}

export interface AppData {
  version: number;
  users: User[];
  students: Record<string, StudentProfile>;
  residents: Resident[];
  requests: CompanionRequest[];
  commitments: Commitment[];
  visits: Visit[];
  tickets: SupportTicket[];
  journal: JournalEntry[];
  sessionUserId: string | null;
}
