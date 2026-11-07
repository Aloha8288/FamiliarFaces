/**
 * FamiliarFaces Companion Matching
 * --------------------------------
 * A deterministic, explainable score between a student and a resident.
 *
 *   Shared Interests                 30%
 *   Preferred Companion Personality  25%
 *   Schedule Compatibility           20%
 *   Shared Languages                 15%
 *   Visit Preferences & Practical    10%
 *
 * Missing information is treated as "neutral" (partial credit), never as
 * incompatibility. Medical, mobility, and topics-to-avoid data are never scored.
 */
import type { Resident, StudentProfile, TimeWindow } from './types';
import { NO_PREFERENCE, normalizeTrait, DAY_NAMES } from './options';
import { dayPart, overlapWindows, windowMinutes } from './time';

export interface FactorScore {
  key: 'interests' | 'personality' | 'schedule' | 'languages' | 'practical';
  label: string;
  weight: number;
  score: number; // 0..1
  detail: string;
  neutral: boolean;
}

export interface MatchResult {
  total: number; // 0..100
  factors: FactorScore[];
  sharedInterests: string[];
  sharedTraits: string[];
  sharedLanguages: string[];
  sharedSlots: { day: number; windows: TimeWindow[] }[];
  explanation: string;
}

const NEUTRAL = 0.6;
/** Reads naturally after "someone" / "is": "patient", "a good listener". */
const traitPhrase = (t: string) => { const x = normalizeTrait(t).toLowerCase(); return x === 'good listener' ? 'a good listener' : x; };
const lower = (s: string) => s.trim().toLowerCase();

const listJoin = (items: string[]) => {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

export function studentInterests(s: StudentProfile) {
  return [...s.interests.filter((i) => i !== 'Other'), ...s.customInterests];
}
export function residentInterests(r: Resident) {
  return [...r.interests.filter((i) => i !== 'Other'), ...r.customInterests];
}

const USABLE_FLUENCY = new Set(['Conversational', 'Fluent']);

export function computeMatch(s: StudentProfile, r: Resident): MatchResult {
  // 1. Interests — 30%
  const sI = studentInterests(s);
  const rI = residentInterests(r);
  const rSet = new Set(rI.map(lower));
  const sharedInterests = sI.filter((i) => rSet.has(lower(i)));
  let interestScore = NEUTRAL;
  let interestNeutral = true;
  if (sI.length && rI.length) {
    interestNeutral = false;
    const denom = Math.min(sI.length, rI.length, 6);
    interestScore = Math.min(1, sharedInterests.length / denom);
  }

  // 2. Preferred companion personality — 25%
  const prefs = r.preferredTraits.filter((t) => t !== 'Other');
  const sTraits = new Set(s.personality.map(normalizeTrait));
  let traitScore = NEUTRAL;
  let traitNeutral = true;
  let sharedTraits: string[] = [];
  if (prefs.includes(NO_PREFERENCE) || prefs.length === 0) {
    traitScore = 0.85; // open to anyone — slightly favourable, not penalising
  } else if (s.personality.length) {
    traitNeutral = false;
    sharedTraits = prefs.filter((t) => sTraits.has(normalizeTrait(t)));
    const denom = Math.min(prefs.length, 3);
    traitScore = Math.min(1, sharedTraits.length / denom);
  }

  // 3. Schedule — 20%
  const sharedSlots: { day: number; windows: TimeWindow[] }[] = [];
  const studentHasAvail = s.availability.some((d) => d.available && d.windows.length);
  const residentHasAvail = r.availability.some((d) => d.available && d.windows.length);
  let scheduleScore = NEUTRAL;
  let scheduleNeutral = true;
  if (studentHasAvail && residentHasAvail) {
    scheduleNeutral = false;
    const needed = Math.min(30, r.visitDuration || 30);
    for (let d = 0; d < 7; d++) {
      const a = s.availability[d];
      const b = r.availability[d];
      if (!a?.available || !b?.available) continue;
      const ov = overlapWindows(a.windows, b.windows).filter((w) => windowMinutes(w) >= needed);
      if (ov.length) sharedSlots.push({ day: d, windows: ov });
    }
    const target = Math.max(1, Math.min(2, s.visitsPerWeek || 1));
    scheduleScore = Math.min(1, sharedSlots.length / target);
  }

  // 4. Languages — 15%
  const sLangs = s.languages.filter((l) => USABLE_FLUENCY.has(l.fluency)).map((l) => l.language);
  if (s.otherLanguage && s.languages.some((l) => l.language === 'Other' && USABLE_FLUENCY.has(l.fluency))) {
    sLangs.push(s.otherLanguage);
  }
  const rLangs = [...r.languages.filter((l) => l !== 'Other'), ...(r.otherLanguage ? [r.otherLanguage] : [])];
  const rLangSet = new Set(rLangs.map(lower));
  const sharedLanguages = sLangs.filter((l) => l !== 'Other' && rLangSet.has(lower(l)));
  let langScore = NEUTRAL;
  let langNeutral = true;
  if (sLangs.length && rLangs.length) {
    langNeutral = false;
    if (sharedLanguages.length === 0) langScore = 0;
    else {
      // Full credit when you share the resident's first (most comfortable) language.
      const primary = lower(rLangs[0] ?? '');
      langScore = sharedLanguages.some((l) => lower(l) === primary) ? 1 : 0.8;
    }
  }

  // 5. Practical — 10% (visit duration + preferred care home / area)
  const parts: number[] = [];
  let practicalNeutral = true;
  if (s.visitDuration && r.visitDuration) {
    const diff = Math.abs(s.visitDuration - r.visitDuration);
    parts.push(diff === 0 ? 1 : diff <= 30 ? 0.7 : 0.35);
  }
  const area = lower(s.preferredArea || '');
  const anyArea = !area || area.includes('any') || area.includes('no preference');
  if (!anyArea) {
    const homeMatch = lower(r.careHome).includes(area) || area.includes(lower(r.careHome)) ||
      (r.neighbourhood && (area.includes(lower(r.neighbourhood)) || lower(r.neighbourhood).includes(area)));
    parts.push(homeMatch ? 1 : 0.4);
  }
  let practicalScore = NEUTRAL;
  if (parts.length) {
    practicalNeutral = false;
    practicalScore = parts.reduce((a, b) => a + b, 0) / parts.length;
  }
  const durationMatch = s.visitDuration && r.visitDuration && s.visitDuration === r.visitDuration;

  const factors: FactorScore[] = [
    {
      key: 'interests', label: 'Shared Interests', weight: 30, score: interestScore, neutral: interestNeutral,
      detail: interestNeutral ? 'Not enough interest information yet, scored neutrally.'
        : sharedInterests.length ? `${sharedInterests.length} shared: ${sharedInterests.join(', ')}` : 'No overlapping interests yet.',
    },
    {
      key: 'personality', label: 'Preferred Companion Personality', weight: 25, score: traitScore, neutral: traitNeutral,
      detail: prefs.includes(NO_PREFERENCE) || prefs.length === 0 ? 'Family is open to any companion personality.'
        : traitNeutral ? 'Add your personality traits to compare.'
        : sharedTraits.length ? `You match: ${sharedTraits.join(', ')}` : `Prefers: ${prefs.join(', ')}`,
    },
    {
      key: 'schedule', label: 'Schedule Compatibility', weight: 20, score: scheduleScore, neutral: scheduleNeutral,
      detail: scheduleNeutral ? 'Availability not provided, scored neutrally.'
        : sharedSlots.length ? `Overlap on ${sharedSlots.map((s) => DAY_NAMES[s.day]).join(', ')}` : 'No overlapping availability.',
    },
    {
      key: 'languages', label: 'Shared Languages', weight: 15, score: langScore, neutral: langNeutral,
      detail: langNeutral ? 'Language information incomplete, scored neutrally.'
        : sharedLanguages.length ? `You both speak ${listJoin(sharedLanguages)}` : 'No shared conversational language.',
    },
    {
      key: 'practical', label: 'Visit Preferences', weight: 10, score: practicalScore, neutral: practicalNeutral,
      detail: practicalNeutral ? 'No practical preferences to compare.'
        : `${durationMatch ? `Same preferred visit length (${r.visitDuration} min)` : `Prefers ${r.visitDuration}-min visits`}${anyArea ? '' : ` · ${r.careHome}`}`,
    },
  ];

  const total = Math.round(factors.reduce((sum, f) => sum + f.score * f.weight, 0));

  // Natural-language explanation
  const bits: string[] = [];
  if (sharedInterests.length) bits.push(`enjoy ${listJoin(sharedInterests.slice(0, 3).map((x) => x.toLowerCase()))}`);
  if (sharedLanguages.length) bits.push(`speak ${listJoin(sharedLanguages.slice(0, 2))}`);
  let slotText = '';
  if (sharedSlots.length) {
    const first = sharedSlots[0];
    slotText = `are available on ${DAY_NAMES[first.day]} ${dayPart(first.windows[0].start)}s`;
  }
  let explanation = '';
  if (bits.length || slotText) {
    const all = [...bits, ...(slotText ? [slotText] : [])];
    explanation = `You both ${listJoin(all)}.`;
  } else {
    explanation = 'Add more profile details to see why this could be a good match.';
  }
  if (sharedTraits.length) {
    explanation += ` ${r.preferredName || r.fullName.split(' ')[0]}'s family is looking for someone ${listJoin(sharedTraits.slice(0, 2).map(traitPhrase))}.`;
  } else if (prefs.includes(NO_PREFERENCE)) {
    explanation += ' The family is open to any companion personality.';
  }

  return { total, factors, sharedInterests, sharedTraits, sharedLanguages, sharedSlots, explanation };
}

export const scoreTone = (n: number) => (n >= 75 ? 'Excellent Match' : n >= 60 ? 'Strong Match' : n >= 45 ? 'Good Match' : 'Possible Match');

/** The same match, explained from the family's point of view. */
export function explainForFamily(m: MatchResult, s: StudentProfile, r: Resident): string {
  const sName = s.fullName.split(' ')[0] || 'This volunteer';
  const rName = r.preferredName || r.fullName.split(' ')[0];
  const bits: string[] = [];
  if (m.sharedInterests.length) bits.push(`enjoy ${listJoin(m.sharedInterests.slice(0, 3).map((x) => x.toLowerCase()))}`);
  if (m.sharedLanguages.length) bits.push(`speak ${listJoin(m.sharedLanguages.slice(0, 2))}`);
  if (m.sharedSlots.length) bits.push(`are free on ${DAY_NAMES[m.sharedSlots[0].day]} ${dayPart(m.sharedSlots[0].windows[0].start)}s`);
  let out = bits.length ? `${sName} and ${rName} both ${listJoin(bits)}.` : `${sName} could still be a lovely fit for ${rName}.`;
  if (m.sharedTraits.length) out += ` ${sName} is ${listJoin(m.sharedTraits.slice(0, 2).map(traitPhrase))}, just as you hoped.`;
  return out;
}
