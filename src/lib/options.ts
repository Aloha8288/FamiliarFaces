export const INTERESTS = [
  'Reading', 'Music', 'Singing', 'Playing Instruments', 'Painting', 'Drawing', 'Crafts', 'Knitting',
  'Crocheting', 'Gardening', 'Cooking', 'Baking', 'Board Games', 'Card Games', 'Puzzles', 'Chess',
  'Sports', 'Walking', 'Nature', 'Animals', 'Movies', 'Television', 'History', 'Travel', 'Photography',
  'Technology', 'Storytelling', 'Dancing', 'Fitness', 'Community Events', 'Other',
];

export const STUDENT_PERSONALITY = [
  'Quiet', 'Calm', 'Gentle', 'Patient', 'Talkative', 'Outgoing', 'Vibrant / Energetic', 'Funny / Playful',
  'Good Listener', 'Warm', 'Creative', 'Adventurous', 'Empathetic', 'Other',
];

export const COMPANION_TRAITS = [
  'Quiet', 'Calm', 'Gentle', 'Patient', 'Talkative', 'Outgoing', 'Vibrant / Energetic', 'Funny / Playful',
  'Good Listener', 'Warm / Affectionate', 'Creative', 'Adventurous', 'Empathetic', 'Other', 'No Preference',
];

export const NO_PREFERENCE = 'No Preference';

/** Normalizes trait names so "Warm" (student) and "Warm / Affectionate" (family) compare as equal. */
export function normalizeTrait(t: string): string {
  if (t === 'Warm / Affectionate') return 'Warm';
  return t;
}

export const LANGUAGES = [
  'English', 'French', 'Spanish', 'Mandarin', 'Cantonese', 'Punjabi', 'Hindi', 'Arabic', 'Tagalog', 'Other',
];

export const FLUENCY_LEVELS = ['Basic', 'Conversational', 'Fluent'] as const;

export const COMMUNICATION = [
  'Enjoys Conversation', 'Prefers Listening', 'Likes Being Asked Questions', 'Prefers Gentle, Slow Communication',
  'Enjoys Storytelling', 'Enjoys Reminiscing', 'Prefers Short Conversations', 'Enjoys Quiet Companionship',
  'Enjoys Shared Activities Without Much Talking', 'Needs Extra Time to Respond', 'Other',
];

export const MOBILITY = [
  'Comfortable Walking Outdoors', 'Enjoys Short Supervised Walks', 'Prefers Indoor Activities',
  'Prefers Seated Activities', 'Uses a Walker', 'Uses a Wheelchair', 'Requires Staff Assistance', 'Other',
];

export const TOPICS_TO_AVOID = [
  'Sensitive Memories', 'Family-Related Topics', 'Medical Conditions', 'Politics', 'Religion', 'Grief or Loss', 'Other',
];

export const YEARS_OF_STUDY = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year +', 'Graduate Student'];

export const DURATIONS = [30, 45, 60, 90, 120];

export const CARE_HOMES = [
  'Maple Grove Residence',
  'Riverbend Care Centre',
  'Willow Creek Lodge',
  'Aspen Gardens Seniors Home',
  'Cedar Hill Manor',
];

export const RELATIONSHIPS = ['Daughter', 'Son', 'Spouse / Partner', 'Grandchild', 'Niece / Nephew', 'Sibling', 'Legal Guardian', 'Friend', 'Other'];

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DAY_PRESETS = {
  Morning: { start: '09:00', end: '12:00' },
  Afternoon: { start: '13:00', end: '17:00' },
  Evening: { start: '17:30', end: '20:00' },
} as const;

export const DEMO_CHECKIN_CODE = 'FF-CARE';
