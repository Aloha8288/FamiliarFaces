import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AppData, Commitment, Mood, Resident, Role, StudentProfile, User, Visit } from './types';
import { blankStudent, createSeedData, demoHash, DATA_VERSION, DEMO_FAMILY_EMAIL, DEMO_STUDENT_EMAIL } from './seed';
import { blankResident } from './residents';
import { isSameWeek } from './time';
import { DEMO_CHECKIN_CODE } from './options';

const STORAGE_KEY = 'familiarfaces:data:v2';

const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const nowIso = () => new Date().toISOString();

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      if (parsed && parsed.version === DATA_VERSION && Array.isArray(parsed.users)) return parsed;
    }
  } catch {
    /* storage unavailable — fall back to fresh seed */
  }
  return createSeedData();
}

type Result = { ok: true; id?: string } | { ok: false; error: string };
const ok = (id?: string): Result => ({ ok: true, id });
const fail = (error: string): Result => ({ ok: false, error });

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function useStoreValue() {
  const [data, setData] = useState<AppData>(load);
  const [storageWarning, setStorageWarning] = useState(false);
  const dataRef = useRef(data);
  dataRef.current = data;
  // Where to land after an account switch (used by route guards so switching never bounces to the wrong page).
  const nextPathRef = useRef<string | null>(null);
  const peekNextPath = () => nextPathRef.current;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setStorageWarning(false);
    } catch {
      setStorageWarning(true);
    }
  }, [data]);

  /** Apply a mutation to a deep copy of the state. */
  const mutate = useCallback((fn: (d: AppData) => void) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as AppData;
      fn(next);
      return next;
    });
  }, []);

  const user = data.users.find((u) => u.id === data.sessionUserId) ?? null;

  // ---------- Auth ----------
  const register = (email: string, password: string, displayName: string): Result => {
    const e = email.trim().toLowerCase();
    if (!e) return fail('Please enter an email.');
    if (!password) return fail('Please enter a password.');
    const existing = dataRef.current.users.find((u) => u.email === e);
    if (existing) {
      // Demo behaviour: registering with a known email simply signs into that account.
      mutate((d) => { d.sessionUserId = existing.id; });
      return ok(existing.id);
    }
    const u: User = {
      id: uid('user'), email: e, passwordHash: demoHash(password), role: null,
      displayName: displayName.trim() || e.split('@')[0], onboarded: false, createdAt: nowIso(),
    };
    mutate((d) => {
      d.users.push(u);
      d.sessionUserId = u.id;
    });
    return ok(u.id);
  };

  const signIn = (email: string, password: string): Result => {
    const e = email.trim().toLowerCase();
    if (!e) return fail('Please enter an email.');
    if (!password) return fail('Please enter a password.');
    // Demo sign-in: any valid email and any password works.
    // A returning email opens its saved account; a new email starts a fresh account.
    const u = dataRef.current.users.find((x) => x.email === e);
    if (!u) return register(e, password, '');
    mutate((d) => { d.sessionUserId = u.id; });
    return ok(u.id);
  };

  const signOut = (landing = '/') => {
    nextPathRef.current = landing;
    setTimeout(() => { nextPathRef.current = null; }, 1000);
    mutate((d) => { d.sessionUserId = null; });
  };

  const switchToDemo = (which: 'student' | 'family', landing?: string) => {
    nextPathRef.current = landing ?? (which === 'student' ? '/student' : '/family');
    setTimeout(() => { nextPathRef.current = null; }, 1000);
    const email = which === 'student' ? DEMO_STUDENT_EMAIL : DEMO_FAMILY_EMAIL;
    let target = dataRef.current.users.find((u) => u.email === email);
    if (!target) {
      // Demo account was somehow removed — restore it from seed without touching other data.
      const seed = createSeedData();
      target = seed.users.find((u) => u.email === email)!;
      const seedUser = target;
      mutate((d) => {
        d.users.push(seedUser);
        if (which === 'student') d.students[seedUser.id] = seed.students[seedUser.id];
      });
    }
    const id = target.id;
    mutate((d) => { d.sessionUserId = id; });
  };

  const setRole = (role: Role) => {
    if (!user) return;
    const userId = user.id;
    mutate((d) => {
      const u = d.users.find((x) => x.id === userId)!;
      u.role = role;
      if (role === 'student' && !d.students[userId]) d.students[userId] = blankStudent(userId, EMAIL_RE.test(u.email) ? u.email : '');
      if (role === 'family' && !d.residents.some((r) => r.familyUserId === userId)) {
        const res = blankResident(uid('res'), userId);
        res.family.email = EMAIL_RE.test(u.email) ? u.email : '';
        res.family.name = u.displayName;
        d.residents.push(res);
      }
    });
  };

  const updateAccount = (patch: Partial<Pick<User, 'displayName'>>) => {
    if (!user) return;
    const id = user.id;
    mutate((d) => { Object.assign(d.users.find((u) => u.id === id)!, patch); });
  };

  const completeOnboarding = () => {
    if (!user) return;
    const id = user.id;
    mutate((d) => { d.users.find((u) => u.id === id)!.onboarded = true; });
  };

  // ---------- Profiles ----------
  const saveStudent = (patch: Partial<StudentProfile>) => {
    if (!user) return;
    const id = user.id;
    mutate((d) => {
      d.students[id] = { ...(d.students[id] ?? blankStudent(id, user.email)), ...patch };
      if (patch.fullName) d.users.find((u) => u.id === id)!.displayName = patch.fullName;
    });
  };

  const saveResident = (res: Resident) => {
    mutate((d) => {
      const i = d.residents.findIndex((r) => r.id === res.id);
      if (i >= 0) d.residents[i] = res;
      else d.residents.push(res);
    });
  };

  // ---------- Requests ----------
  const activeCommitmentForStudent = (studentId: string, d = dataRef.current) =>
    d.commitments.find((c) => c.studentId === studentId && c.active) ?? null;
  const activeCommitmentForResident = (residentId: string, d = dataRef.current) =>
    d.commitments.find((c) => c.residentId === residentId && c.active) ?? null;

  const requestCompanion = (residentId: string, message: string): Result => {
    if (!user) return fail('Please sign in.');
    const d = dataRef.current;
    if (activeCommitmentForStudent(user.id)) return fail('You already have an active Companion Commitment.');
    if (activeCommitmentForResident(residentId)) return fail('This resident is already matched with a companion.');
    const dup = d.requests.find((r) => r.studentId === user.id && r.residentId === residentId && r.status === 'pending');
    if (dup) return fail(dup.from === 'family' ? 'This family has already invited you, check your dashboard to respond.' : 'You already have a pending request for this resident.');
    const pendingCount = d.requests.filter((r) => r.studentId === user.id && r.status === 'pending' && r.from !== 'family').length;
    if (pendingCount >= 3) return fail('You can have up to 3 pending requests at a time. Withdraw one to send another.');
    const id = uid('req');
    const studentId = user.id;
    mutate((x) => {
      x.requests.push({ id, studentId, residentId, message: message.trim(), status: 'pending', createdAt: nowIso(), decidedAt: null, decisionNote: '', from: 'student' });
    });
    return ok(id);
  };

  /** A family invites a volunteer to become their loved one's companion. */
  const inviteVolunteer = (studentId: string, message: string): Result => {
    if (!user) return fail('Please sign in.');
    const d = dataRef.current;
    const resident = d.residents.find((r) => r.familyUserId === user.id);
    if (!resident) return fail('Please finish your loved one\'s profile first.');
    if (activeCommitmentForResident(resident.id)) return fail('Your loved one already has a companion.');
    if (activeCommitmentForStudent(studentId)) return fail('This volunteer is already matched with someone else.');
    const dup = d.requests.find((r) => r.studentId === studentId && r.residentId === resident.id && r.status === 'pending');
    if (dup) return fail(dup.from === 'family' ? 'You already invited this volunteer.' : 'This volunteer already sent you a request, accept it from Requests.');
    const id = uid('req');
    mutate((x) => {
      x.requests.push({ id, studentId, residentId: resident.id, message: message.trim(), status: 'pending', createdAt: nowIso(), decidedAt: null, decisionNote: '', from: 'family' });
    });
    return ok(id);
  };

  const withdrawRequest = (requestId: string) =>
    mutate((d) => {
      const r = d.requests.find((x) => x.id === requestId);
      if (r && r.status === 'pending') { r.status = 'withdrawn'; r.decidedAt = nowIso(); }
    });

  const decideRequest = (requestId: string, accept: boolean, note = ''): Result => {
    const d = dataRef.current;
    const req = d.requests.find((x) => x.id === requestId);
    if (!req || req.status !== 'pending') return fail('This request is no longer pending.');
    if (accept) {
      if (activeCommitmentForResident(req.residentId)) return fail('This resident already has an active companion.');
      if (activeCommitmentForStudent(req.studentId)) return fail('This volunteer already has an active commitment.');
    }
    const commitmentId = uid('com');
    mutate((x) => {
      const r = x.requests.find((y) => y.id === requestId)!;
      r.status = accept ? 'accepted' : 'declined';
      r.decidedAt = nowIso();
      r.decisionNote = note.trim();
      if (accept) {
        const student = x.students[r.studentId];
        const c: Commitment = {
          id: commitmentId, studentId: r.studentId, residentId: r.residentId, matchedAt: nowIso(),
          weeklyGoal: Math.max(1, Math.min(3, student?.visitsPerWeek || 2)), active: true, endedAt: null,
        };
        x.commitments.push(c);
        // Close the student's other pending requests and other students' requests for this resident.
        for (const o of x.requests) {
          if (o.id === r.id || o.status !== 'pending') continue;
          if (o.studentId === r.studentId) { o.status = 'withdrawn'; o.decidedAt = nowIso(); o.decisionNote = 'Automatically withdrawn, matched with another resident.'; }
          else if (o.residentId === r.residentId) { o.status = 'declined'; o.decidedAt = nowIso(); o.decisionNote = 'This resident has been matched with another companion.'; }
        }
      }
    });
    return ok(accept ? commitmentId : undefined);
  };

  const updateCommitmentGoal = (commitmentId: string, goal: number) =>
    mutate((d) => { const c = d.commitments.find((x) => x.id === commitmentId); if (c) c.weeklyGoal = Math.max(1, Math.min(5, goal)); });

  const endCommitment = (commitmentId: string) =>
    mutate((d) => {
      const c = d.commitments.find((x) => x.id === commitmentId);
      if (!c) return;
      c.active = false;
      c.endedAt = nowIso();
      for (const v of d.visits) if (v.commitmentId === c.id && v.status === 'scheduled') v.status = 'cancelled';
    });

  // ---------- Visits ----------
  const scheduleVisit = (commitmentId: string, start: Date, minutes: number): Result => {
    const d = dataRef.current;
    const c = d.commitments.find((x) => x.id === commitmentId && x.active);
    if (!c) return fail('No active commitment found.');
    if (Number.isNaN(start.getTime())) return fail('Please choose a valid date and time.');
    if (start.getTime() < Date.now() - 60_000) return fail('Please choose a time in the future.');
    if (minutes < 15 || minutes > 240) return fail('Visits should be between 15 minutes and 4 hours.');
    const end = start.getTime() + minutes * 60_000;
    const clash = d.visits.find((v) => v.studentId === c.studentId && (v.status === 'scheduled' || v.status === 'active') && (() => {
      const s = new Date(v.scheduledStart).getTime();
      const e = s + v.plannedMinutes * 60_000;
      return start.getTime() < e && end > s;
    })());
    if (clash) return fail('This overlaps with another scheduled visit.');
    const id = uid('visit');
    mutate((x) => {
      x.visits.push({
        id, commitmentId: c.id, studentId: c.studentId, residentId: c.residentId, scheduledStart: start.toISOString(),
        plannedMinutes: minutes, status: 'scheduled', checkInAt: null, checkOutAt: null, minutes: 0, approval: null,
        familyNote: '', studentNote: '', createdAt: nowIso(),
      });
    });
    return ok(id);
  };

  const cancelVisit = (visitId: string) =>
    mutate((d) => { const v = d.visits.find((x) => x.id === visitId); if (v && v.status === 'scheduled') v.status = 'cancelled'; });

  const checkIn = (code: string, visitId: string | null): Result => {
    if (!user) return fail('Please sign in.');
    if (code.trim().toUpperCase() !== DEMO_CHECKIN_CODE) return fail(`That code wasn't recognized. The front-desk code is ${DEMO_CHECKIN_CODE}.`);
    const d = dataRef.current;
    const c = activeCommitmentForStudent(user.id);
    if (!c) return fail('You need an active Companion Commitment before checking in.');
    if (d.visits.some((v) => v.studentId === user.id && v.status === 'active')) return fail('You already have an active visit. Please check out first.');
    const studentId = user.id;
    const durationDefault = d.students[user.id]?.visitDuration || 60;
    const existing = visitId ? d.visits.find((y) => y.id === visitId && y.status === 'scheduled') : undefined;
    const targetId = existing ? existing.id : uid('visit');
    mutate((x) => {
      let v = existing ? x.visits.find((y) => y.id === targetId) : undefined;
      if (!v) {
        v = {
          id: targetId, commitmentId: c.id, studentId, residentId: c.residentId, scheduledStart: nowIso(),
          plannedMinutes: durationDefault, status: 'scheduled', checkInAt: null, checkOutAt: null, minutes: 0,
          approval: null, familyNote: '', studentNote: 'Unscheduled visit', createdAt: nowIso(),
        } as Visit;
        x.visits.push(v);
      }
      v.status = 'active';
      v.checkInAt = nowIso();
    });
    return ok(targetId);
  };

  /** fastForwardMinutes: presentation helper that back-dates the check-in so a demo visit has realistic length. */
  const checkOut = (studentNote: string, fastForwardMinutes = 0): Result => {
    if (!user) return fail('Please sign in.');
    const active = dataRef.current.visits.find((v) => v.studentId === user.id && v.status === 'active');
    if (!active) return fail('There is no active visit to check out of. Please check in first.');
    const id = active.id;
    mutate((x) => {
      const v = x.visits.find((y) => y.id === id)!;
      if (v.status !== 'active') return; // guards against double check-out
      const out = new Date();
      let inAt = new Date(v.checkInAt!);
      if (fastForwardMinutes > 0) inAt = new Date(out.getTime() - fastForwardMinutes * 60_000);
      v.checkInAt = inAt.toISOString();
      v.checkOutAt = out.toISOString();
      v.minutes = Math.max(1, Math.round((out.getTime() - inAt.getTime()) / 60_000));
      v.status = 'completed';
      v.approval = 'pending';
      v.studentNote = studentNote.trim() || (v.studentNote === 'Unscheduled visit' ? v.studentNote : '');
    });
    return ok(id);
  };

  const reviewVisit = (visitId: string, approval: 'approved' | 'disputed' | 'pending', note?: string) =>
    mutate((d) => {
      const v = d.visits.find((x) => x.id === visitId);
      if (!v || v.status !== 'completed') return;
      v.approval = approval;
      if (note !== undefined) v.familyNote = note.trim();
    });

  const setVisitNote = (visitId: string, note: string) =>
    mutate((d) => { const v = d.visits.find((x) => x.id === visitId); if (v) v.familyNote = note.trim(); });

  // ---------- Journal ----------
  const addJournalEntry = (entry: { talkedAbout: string; enjoyed: string; mood: Mood | null; visitId?: string | null }): Result => {
    if (!user) return fail('Please sign in.');
    const c = activeCommitmentForStudent(user.id);
    if (!c) return fail('You need an active Companion Commitment to write in the journal.');
    if (!entry.talkedAbout.trim() && !entry.enjoyed.trim()) return fail('Write a little about your visit first.');
    const id = uid('jrnl');
    const studentId = user.id;
    mutate((d) => {
      d.journal.unshift({
        id, commitmentId: c.id, studentId, residentId: c.residentId, visitId: entry.visitId ?? null, createdAt: nowIso(),
        talkedAbout: entry.talkedAbout.trim(), enjoyed: entry.enjoyed.trim(), mood: entry.mood,
      });
    });
    return ok(id);
  };

  const deleteJournalEntry = (id: string) => mutate((d) => { d.journal = d.journal.filter((j) => j.id !== id); });

  // ---------- Support ----------
  const addTicket = (category: string, message: string) => {
    if (!user) return '';
    const reference = `FF-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const userId = user.id;
    const id = uid('tkt');
    mutate((d) => { d.tickets.unshift({ id, userId, category, message: message.trim(), createdAt: nowIso(), reference }); });
    return reference;
  };

  const resetDemo = () => {
    nextPathRef.current = '/signin';
    const fresh = createSeedData();
    setData(fresh);
  };

  return {
    data, user, storageWarning,
    register, signIn, signOut, switchToDemo, peekNextPath, setRole, updateAccount, completeOnboarding,
    saveStudent, saveResident,
    requestCompanion, inviteVolunteer, withdrawRequest, decideRequest, updateCommitmentGoal, endCommitment,
    scheduleVisit, cancelVisit, checkIn, checkOut, reviewVisit, setVisitNote,
    addJournalEntry, deleteJournalEntry, addTicket, resetDemo,
  };
}

export type Store = ReturnType<typeof useStoreValue>;
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}

// ---------- Selectors ----------
export function useStudentView() {
  const store = useStore();
  const { data, user } = store;
  return useMemo(() => {
    const profile = user ? data.students[user.id] ?? null : null;
    const commitment = user ? data.commitments.find((c) => c.studentId === user.id && c.active) ?? null : null;
    const resident = commitment ? data.residents.find((r) => r.id === commitment.residentId) ?? null : null;
    const myVisits = user ? data.visits.filter((v) => v.studentId === user.id) : [];
    const stats = commitmentStats(myVisits.filter((v) => !commitment || v.commitmentId === commitment.id), commitment);
    const approvedMinutesAll = myVisits.filter((v) => v.status === 'completed' && v.approval === 'approved').reduce((s, v) => s + v.minutes, 0);
    const activeVisit = myVisits.find((v) => v.status === 'active') ?? null;
    const requests = user ? data.requests.filter((r) => r.studentId === user.id) : [];
    return { profile, commitment, resident, myVisits, stats, approvedMinutesAll, activeVisit, requests };
  }, [data, user]);
}

export function useFamilyView() {
  const { data, user } = useStore();
  return useMemo(() => {
    const resident = user ? data.residents.find((r) => r.familyUserId === user.id) ?? null : null;
    const commitment = resident ? data.commitments.find((c) => c.residentId === resident.id && c.active) ?? null : null;
    const student = commitment ? data.students[commitment.studentId] ?? null : null;
    const visits = resident ? data.visits.filter((v) => v.residentId === resident.id) : [];
    const requests = resident ? data.requests.filter((r) => r.residentId === resident.id) : [];
    const stats = commitmentStats(visits.filter((v) => !commitment || v.commitmentId === commitment.id), commitment);
    return { resident, commitment, student, visits, requests, stats };
  }, [data, user]);
}

export function commitmentStats(visits: Visit[], commitment: Commitment | null) {
  const now = Date.now();
  const completed = visits.filter((v) => v.status === 'completed');
  // Count each visit once (by id) — protects the weekly progress from duplicates.
  const uniqueThisWeek = new Map<string, Visit>();
  for (const v of completed) if (v.checkOutAt && isSameWeek(v.checkOutAt)) uniqueThisWeek.set(v.id, v);
  const completedThisWeek = uniqueThisWeek.size;
  const goal = commitment?.weeklyGoal ?? 2;
  const upcoming = visits
    .filter((v) => v.status === 'scheduled' && new Date(v.scheduledStart).getTime() + v.plannedMinutes * 60_000 > now)
    .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart));
  const approvedMinutes = completed.filter((v) => v.approval === 'approved').reduce((s, v) => s + v.minutes, 0);
  const pendingMinutes = completed.filter((v) => v.approval === 'pending').reduce((s, v) => s + v.minutes, 0);
  return {
    completedThisWeek,
    goal,
    percent: Math.min(100, Math.round((completedThisWeek / Math.max(1, goal)) * 100)),
    totalCompleted: completed.length,
    upcoming,
    next: upcoming[0] ?? null,
    approvedMinutes,
    pendingMinutes,
    pendingApprovals: completed.filter((v) => v.approval === 'pending'),
    completed: [...completed].sort((a, b) => (b.checkOutAt ?? '').localeCompare(a.checkOutAt ?? '')),
  };
}
