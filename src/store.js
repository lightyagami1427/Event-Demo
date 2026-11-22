import { useSyncExternalStore } from 'react';

// Demo-only store. Everything lives in localStorage and syncs across open tabs,
// so a scan in the volunteer flow shows up live in the admin panel.
const KEY = 'sparkfest-demo-v2';

export const PRICES = { day: 499, creator: 799 };
export const TIERS = {
  day: { name: 'Day pass', desc: 'Saturday 12 Dec, all talks and live sets' },
  creator: { name: 'Creator pass', desc: 'Both days, with priority workshop seats' },
};
export const STATIONS = [
  { id: 'entry', label: 'Venue entry', short: 'Entry', icon: 'entry' },
  { id: 'bag', label: 'Goodie bag', short: 'Goodie bag', icon: 'bag' },
  { id: 'stall', label: 'Stall access', short: 'Stalls', icon: 'stall' },
  { id: 'perk', label: 'Digital perks', short: 'Perks', icon: 'spark' },
];
export const ROLES = {
  'student@mail.com': 'student',
  'volunteer@mail.com': 'volunteer',
  'admin@mail.com': 'admin',
  'influencer@mail.com': 'ambassador',
};
export const COLLEGES = ['JNAFAU', 'IIIT Hyderabad', 'Osmania University', 'NIFT Hyderabad', 'University of Hyderabad', 'CBIT', 'Vasavi College', 'St. Francis College'];
export const DEPTS = ['Applied Arts', 'Communication Design', 'Computer Science', 'Fashion Design', 'Fine Arts', 'Architecture', 'Mass Communication', 'Electronics'];
export const INTERESTS = ['Illustration', 'Photography', 'Film', 'Music', 'Typography', 'UI design', 'Fashion', 'Writing', 'Animation', 'Craft'];

const FIRST = ['Aarav', 'Diya', 'Ishaan', 'Ananya', 'Kabir', 'Meera', 'Rohan', 'Saanvi', 'Vihaan', 'Tara', 'Arjun', 'Nisha', 'Kavya', 'Reyansh', 'Zoya', 'Advait', 'Sana', 'Dev', 'Ira', 'Yash', 'Pooja', 'Rahul', 'Sneha', 'Farhan', 'Lakshmi', 'Nikhil', 'Aditi', 'Varun', 'Harini', 'Siddharth'];
const LAST = ['Reddy', 'Sharma', 'Iyer', 'Khan', 'Rao', 'Varma', 'Nair', 'Gupta', 'Das', 'Menon', 'Patel', 'Joshi', 'Kulkarni', 'Ali', 'Bose', 'Pillai', 'Chowdary', 'Naidu'];

function rng(seed) {
  let a = seed;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const ago = (min) => Date.now() - min * 60000;

function seed() {
  const r = rng(2026);
  const students = [];
  const scans = [];
  for (let i = 0; i < 240; i++) {
    const name = pick(r, FIRST) + ' ' + pick(r, LAST);
    const code = i < 58 ? 'RIYA10' : (r() < 0.22 ? 'SPARK20' : null);
    const paid = code === 'RIYA10' ? r() < 0.66 : r() < 0.8;
    const tier = r() < 0.62 ? 'creator' : 'day';
    const pct = code === 'RIYA10' ? 10 : code === 'SPARK20' ? 20 : 0;
    const red = {};
    if (paid && r() < 0.58) {
      red.entry = ago(240) + Math.floor(r() * 120) * 60000;
      if (r() < 0.7) red.bag = red.entry + Math.floor(5 + r() * 35) * 60000;
      if (r() < 0.5) red.stall = red.entry + Math.floor(10 + r() * 85) * 60000;
      if (r() < 0.3) red.perk = red.entry + Math.floor(15 + r() * 80) * 60000;
    }
    const s = {
      id: 's' + i, name, profile: true,
      email: name.toLowerCase().replace(' ', '.') + i + '@mail.com',
      phone: '9' + String(Math.floor(r() * 1e9)).padStart(9, '0'),
      college: pick(r, COLLEGES), dept: pick(r, DEPTS), interests: [pick(r, INTERESTS)],
      paid, tier, code, amount: paid ? Math.round(PRICES[tier] * (1 - pct / 100)) : 0,
      payMethod: paid ? (r() < 0.7 ? 'UPI' : 'Card') : null,
      passId: 'SPK-26-' + (1000 + i),
      createdAt: Date.now() - Math.floor(r() * 14) * 86400000 - Math.floor(r() * 8e7),
      red, saved: [],
    };
    students.push(s);
    Object.entries(red).forEach(([station, ts]) => scans.push({ id: s.id + station, at: ts, passId: s.passId, name, station, result: 'success', by: 'Neha Joshi' }));
  }
  students.unshift({
    id: 'me', email: 'student@mail.com', profile: false, name: '', phone: '', college: '', dept: '', interests: [],
    paid: false, tier: null, code: null, amount: 0, payMethod: null, passId: 'SPK-26-0718',
    createdAt: Date.now(), red: {}, saved: ['s2'],
  });
  scans.sort((a, b) => b.at - a.at);

  return {
    students,
    scans: scans.slice(0, 120),
    promos: [
      { code: 'SPARK20', pct: 20, limit: 400, expires: '2026-12-11', active: true, owner: null },
      { code: 'EARLYBIRD', pct: 30, limit: 150, expires: '2026-11-15', active: false, owner: null },
      { code: 'RIYA10', pct: 10, limit: 1000, expires: '2026-12-12', active: true, owner: 'Riya Sharma' },
      { code: 'KABIR10', pct: 10, limit: 1000, expires: '2026-12-12', active: true, owner: 'Kabir Sethi' },
    ],
    sessions: [
      { id: 's1', day: 1, start: '10:00', end: '10:45', kind: 'live', title: 'Opening set: tabla meets synth', speaker: 'Lowkey Collective', place: 'Main stage', desc: 'A live set that pairs classical tabla with modular synths to open the fest.' },
      { id: 's2', day: 1, start: '11:00', end: '12:30', kind: 'workshop', title: 'Kinetic type for posters', speaker: 'Meera Iyer', place: 'Studio B', desc: 'Make a moving poster from one word. Bring a laptop with any design tool.' },
      { id: 's3', day: 1, start: '12:45', end: '13:30', kind: 'talk', title: 'From sketchbook to brand', speaker: 'Rohan Varma', place: 'Main stage', desc: 'How a sketchbook habit turned into an identity system for a national brand.' },
      { id: 's4', day: 1, start: '14:30', end: '16:00', kind: 'workshop', title: 'Film photography walk', speaker: 'Kabir Sethi', place: 'Meet at Gate 2', desc: 'A guided walk around the venue with a roll of film. Cameras provided.' },
      { id: 's5', day: 1, start: '16:30', end: '17:15', kind: 'talk', title: 'Designing for the street', speaker: 'Panel of three studios', place: 'Main stage', desc: 'Signage, murals and the city as a canvas, with three Hyderabad studios.' },
      { id: 's6', day: 1, start: '18:00', end: '19:00', kind: 'live', title: 'Indie night with Saanjh', speaker: 'Saanjh', place: 'Amphitheatre', desc: 'Close day one with a full live set under the string lights.' },
      { id: 's7', day: 2, start: '10:30', end: '12:00', kind: 'workshop', title: 'Zine-making lab', speaker: 'Harini Menon', place: 'Studio A', desc: 'Fold, cut and print a 16-page zine you take home.' },
      { id: 's8', day: 2, start: '12:15', end: '13:00', kind: 'talk', title: 'A portfolio that gets read', speaker: 'Ananya Das', place: 'Main stage', desc: 'What hiring leads actually look at, and what they skip.' },
      { id: 's9', day: 2, start: '14:00', end: '15:30', kind: 'workshop', title: 'Motion basics in After Effects', speaker: 'Dev Kulkarni', place: 'Studio B', desc: 'Keyframes, easing and a 10-second logo sting from scratch.' },
      { id: 's10', day: 2, start: '17:00', end: '18:30', kind: 'live', title: 'Closing showcase', speaker: 'Student collectives', place: 'Main stage', desc: 'Work made over the weekend, shown on the big screen.' },
    ],
    liveId: 's2',
    questions: [
      { id: 'q1', sessionId: 's2', text: 'Which tool is best for kinetic type if I only know Figma?', author: 'Diya R.', votes: 24, voters: [], status: 'approved', pinned: true, at: ago(14) },
      { id: 'q2', sessionId: 's2', text: 'How do you choose a typeface that still reads when it moves fast?', author: 'Arjun N.', votes: 17, voters: [], status: 'approved', pinned: false, at: ago(11) },
      { id: 'q3', sessionId: 's2', text: 'Can we share the poster files after the workshop?', author: 'Sana K.', votes: 9, voters: [], status: 'approved', pinned: false, at: ago(8) },
      { id: 'q4', sessionId: 's2', text: 'Do you ever start with motion before the static layout?', author: 'Ishaan P.', votes: 0, voters: [], status: 'pending', pinned: false, at: ago(4) },
      { id: 'q5', sessionId: 's3', text: 'How many sketchbooks did the identity take?', author: 'Tara M.', votes: 6, voters: [], status: 'approved', pinned: false, at: ago(40) },
      { id: 'q6', sessionId: 's2', text: 'Is this being recorded?', author: 'Varun G.', votes: 0, voters: [], status: 'pending', pinned: false, at: ago(2) },
    ],
    winners: [],
    prize: 'Wacom drawing tablet',
    volunteers: [
      { email: 'volunteer@mail.com', name: 'Kiran Kumar', perms: ['entry', 'bag', 'stall'] },
      { email: 'neha@mail.com', name: 'Neha Joshi', perms: ['entry'] },
      { email: 'arjun.v@mail.com', name: 'Arjun Varma', perms: ['stall', 'perk'] },
    ],
    eventEnded: false,
  };
}

function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) { /* ignore */ }
  return seed();
}

let state = load();
const subs = new Set();
const emit = () => subs.forEach((f) => f());
function set(fn) {
  state = { ...state, ...fn(state) };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  emit();
}
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY && e.newValue) { state = JSON.parse(e.newValue); emit(); }
  });
}
export function useStore() {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => state);
}
export const getState = () => state;

const updateStudent = (id, fn) => set((s) => ({ students: s.students.map((x) => (x.id === id ? { ...x, ...fn(x) } : x)) }));
export const me = (s) => s.students.find((x) => x.id === 'me');
export const promoUses = (s, code) => s.students.filter((x) => x.paid && x.code === code).length;
const TODAY = '2026-11-22';

export const act = {
  saveProfile(data) { updateStudent('me', () => ({ ...data, profile: true })); },

  checkCode(raw) {
    const code = raw.trim().toUpperCase();
    if (!code) return { ok: false, msg: 'Enter a code first.' };
    const p = state.promos.find((x) => x.code === code);
    if (!p) return { ok: false, msg: 'We couldn’t find that code. Check the spelling and try again.' };
    if (!p.active) return { ok: false, msg: 'This code is no longer active.' };
    if (p.expires < TODAY) return { ok: false, msg: 'This code expired on ' + p.expires + '.' };
    if (promoUses(state, code) >= p.limit) return { ok: false, msg: 'This code has reached its usage limit.' };
    return { ok: true, code, pct: p.pct, owner: p.owner };
  },

  purchase({ tier, code, pct, method }) {
    const amount = Math.round(PRICES[tier] * (1 - (pct || 0) / 100));
    updateStudent('me', () => ({ paid: true, tier, code: code || null, amount, payMethod: method, createdAt: Date.now() }));
  },

  toggleSave(id) { updateStudent('me', (x) => ({ saved: x.saved.includes(id) ? x.saved.filter((v) => v !== id) : [...x.saved, id] })); },

  // The heart of the QR system: one code, separate redemption per station.
  scan(passId, station, by) {
    const vol = state.volunteers.find((v) => v.name === by);
    const st = state.students.find((x) => x.passId === passId.trim().toUpperCase());
    let result;
    if (vol && !vol.perms.includes(station)) result = 'unauthorised';
    else if (!st || !st.paid) result = 'invalid';
    else if (st.red[station]) result = 'already';
    else if (station !== 'entry' && !st.red.entry) result = 'noentry';
    else result = 'success';
    const entry = { id: 'x' + Date.now() + Math.random(), at: Date.now(), passId: passId.trim().toUpperCase(), name: st ? st.name || 'Aanya Rao' : 'Unknown code', station, result, by };
    set((s) => ({
      scans: [entry, ...s.scans].slice(0, 200),
      students: result === 'success' ? s.students.map((x) => (x.id === st.id ? { ...x, red: { ...x.red, [station]: Date.now() } } : x)) : s.students,
    }));
    return { result, student: st, prev: st && st.red[station] };
  },
  resetRedemptions(id) { updateStudent(id, () => ({ red: {} })); },

  ask(sessionId, text, author) {
    set((s) => ({ questions: [...s.questions, { id: 'q' + Date.now(), sessionId, text, author, votes: 0, voters: [], status: 'pending', pinned: false, mine: true, at: Date.now() }] }));
  },
  vote(id) {
    set((s) => ({
      questions: s.questions.map((q) => {
        if (q.id !== id) return q;
        const has = q.voters.includes('me');
        return { ...q, votes: q.votes + (has ? -1 : 1), voters: has ? q.voters.filter((v) => v !== 'me') : [...q.voters, 'me'] };
      }),
    }));
  },
  moderate(id, patch) { set((s) => ({ questions: s.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) })); },
  removeQuestion(id) { set((s) => ({ questions: s.questions.filter((q) => q.id !== id) })); },

  addPromo(p) { set((s) => ({ promos: [{ ...p, active: true, owner: null }, ...s.promos] })); },
  togglePromo(code) { set((s) => ({ promos: s.promos.map((p) => (p.code === code ? { ...p, active: !p.active } : p)) })); },

  setLive(id) { set(() => ({ liveId: id })); },
  addSession(x) { set((s) => ({ sessions: [...s.sessions, { ...x, id: 'n' + Date.now() }] })); },
  removeSession(id) { set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })); },

  setPrize(prize) { set(() => ({ prize })); },
  eligible(s = state) {
    const won = new Set(s.winners.map((w) => w.id));
    return s.students.filter((x) => x.paid && x.red.entry && !won.has(x.id));
  },
  draw() {
    const pool = act.eligible();
    if (!pool.length) return null;
    const w = pool[Math.floor(Math.random() * pool.length)];
    const rec = { id: w.id, name: w.name || 'Aanya Rao', college: w.college, passId: w.passId, prize: state.prize, at: Date.now() };
    set((s) => ({ winners: [rec, ...s.winners] }));
    return rec;
  },

  togglePerm(email, station) {
    set((s) => ({ volunteers: s.volunteers.map((v) => (v.email !== email ? v : { ...v, perms: v.perms.includes(station) ? v.perms.filter((p) => p !== station) : [...v.perms, station] })) }));
  },
  addVolunteer(v) { set((s) => ({ volunteers: [...s.volunteers, { ...v, perms: ['entry'] }] })); },
  setEnded(v) { set(() => ({ eventEnded: v })); },

  reset() { state = seed(); try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } emit(); },
};
