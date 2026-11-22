import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore, act, STATIONS, promoUses } from './store.js';
import { Icon, Toaster, toast, Sheet, money, clock, initials, Confetti, Logo } from './ui.jsx';
import { illustration } from './illustration.js';

const TABS = [
  { id: 'live', label: 'Live', icon: 'grid' },
  { id: 'students', label: 'Students', icon: 'users' },
  { id: 'qa', label: 'Q&A', icon: 'chat' },
  { id: 'edip', label: 'E-Dip', icon: 'gift' },
  { id: 'more', label: 'More', icon: 'tag' },
];

export default function Admin({ onLogout }) {
  const s = useStore();
  const [tab, setTab] = useState('live');
  const [sub, setSub] = useState(null);
  const go = (t) => { setTab(t); setSub(null); window.scrollTo(0, 0); };
  const pending = s.questions.filter((q) => q.status === 'pending').length;
  return (
    <div className="mobile">
      <div className="page in" key={tab + sub}>
        {!sub && (
          <div className="row" style={{ marginBottom: 22 }}>
            <div className="avatar">AD</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Control room</div>
              <div className="muted" style={{ fontSize: 13 }}>Spark Fest, Day 1</div>
            </div>
            <span className={'pill ' + (s.eventEnded ? 'grey' : 'green')}><span className={'dot' + (s.eventEnded ? '' : ' pulse')} />{s.eventEnded ? 'Ended' : 'Live'}</span>
          </div>
        )}
        {tab === 'live' && <Live s={s} />}
        {tab === 'students' && <Students s={s} />}
        {tab === 'qa' && <QA s={s} />}
        {tab === 'edip' && <EDip s={s} />}
        {tab === 'more' && !sub && <More s={s} open={(x) => { setSub(x); window.scrollTo(0, 0); }} onLogout={onLogout} />}
        {tab === 'more' && sub && (
          <>
            <button className="iconbtn" style={{ marginBottom: 18 }} onClick={() => setSub(null)} aria-label="Back"><Icon n="back" /></button>
            {sub === 'promos' && <Promos s={s} />}
            {sub === 'schedule' && <Schedule s={s} />}
            {sub === 'volunteers' && <Volunteers s={s} />}
          </>
        )}
      </div>
      <nav className="tabbar five" aria-label="Admin">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} aria-current={tab === t.id ? 'page' : undefined} onClick={() => go(t.id)} style={{ position: 'relative' }}>
            <Icon n={t.icon} />{t.label}
            {t.id === 'qa' && pending > 0 && <span style={{ position: 'absolute', top: 6, right: 'calc(50% - 20px)', minWidth: 16, height: 16, borderRadius: 999, background: '#2B2BEA', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{pending}</span>}
          </button>
        ))}
      </nav>
      <Toaster />
    </div>
  );
}

/* ---------- Live ---------- */
function Live({ s }) {
  const regs = s.students.filter((x) => x.profile);
  const paid = regs.filter((x) => x.paid);
  const inside = paid.filter((x) => x.red.entry);
  const revenue = paid.reduce((n, x) => n + x.amount, 0);
  const colleges = Object.entries(inside.reduce((m, x) => ({ ...m, [x.college]: (m[x.college] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const pct = Math.round((inside.length / paid.length) * 100);
  return (
    <>
      <section className="foil" style={{ borderRadius: 30, padding: 22, boxShadow: '0 28px 44px -30px rgba(43,43,234,.5)' }}>
        <div className="between"><span style={{ fontSize: 14, color: '#3F3F4A' }}>Inside the venue now</span><span className="pill" style={{ background: 'rgba(255,255,255,.7)' }}><span className="dot pulse" style={{ background: '#12805C' }} />Live</span></div>
        <div className="row" style={{ alignItems: 'flex-end', marginTop: 10, gap: 10 }}>
          <span className="num" style={{ fontSize: 72, fontWeight: 600, letterSpacing: '-0.05em', lineHeight: 0.95 }}>{inside.length}</span>
          <span style={{ fontSize: 15, color: '#3F3F4A', paddingBottom: 6 }}>of {paid.length} paid passes</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.7)', marginTop: 18, overflow: 'hidden' }}><div style={{ width: pct + '%', height: '100%', borderRadius: 999, background: '#121217', transition: 'width .6s' }} /></div>
        <div style={{ fontSize: 13, color: '#3F3F4A', marginTop: 8 }}>{pct}% checked in</div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
        {[['Registrations', regs.length], ['Paid passes', paid.length], ['Revenue', money(revenue)], ['Conversion', Math.round((paid.length / regs.length) * 100) + '%']].map(([k, v]) => (
          <div key={k} className="stat"><div className="muted" style={{ fontSize: 13 }}>{k}</div><div className="v">{v}</div></div>
        ))}
      </div>

      <div className="section"><h2 className="h2">Redemptions</h2><span className="muted" style={{ fontSize: 13 }}>One scan per perk</span></div>
      <div className="card" style={{ padding: 18, display: 'grid', gap: 16 }}>
        {STATIONS.map((st) => {
          const n = paid.filter((x) => x.red[st.id]).length;
          return (
            <div key={st.id}>
              <div className="between" style={{ fontSize: 14 }}><span className="row" style={{ gap: 8 }}><Icon n={st.icon} size={17} />{st.label}</span><span className="num"><b>{n}</b> <span className="muted">/ {paid.length}</span></span></div>
              <div className="bar" style={{ marginTop: 8 }}><span style={{ width: (n / paid.length) * 100 + '%' }} /></div>
            </div>
          );
        })}
      </div>

      <div className="section"><h2 className="h2">Live scans</h2><span className="muted" style={{ fontSize: 13 }}>Updates as volunteers scan</span></div>
      <div className="list">
        {s.scans.slice(0, 6).map((x) => (
          <div key={x.id} className="lrow">
            <span style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: x.result === 'success' ? '#E3F4EC' : x.result === 'invalid' ? '#FCE9EA' : '#FCEFD9', color: x.result === 'success' ? '#12805C' : x.result === 'invalid' ? '#C0262D' : '#8A4B0B' }}>
              <Icon n={STATIONS.find((z) => z.id === x.station).icon} size={16} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t ellipsis">{x.name}</div>
              <div className="s">{STATIONS.find((z) => z.id === x.station).short}, {x.result === 'success' ? 'approved' : x.result === 'already' ? 'already redeemed' : x.result === 'noentry' ? 'not checked in' : x.result}</div>
            </div>
            <span className="muted num" style={{ fontSize: 12.5 }}>{clock(x.at)}</span>
          </div>
        ))}
      </div>

      <div className="section"><h2 className="h2">Inside, by college</h2></div>
      <div className="card" style={{ padding: 18, display: 'grid', gap: 14 }}>
        {colleges.map(([c, n]) => (
          <div key={c}>
            <div className="between" style={{ fontSize: 14 }}><span>{c}</span><span className="num muted">{n}</span></div>
            <div className="bar" style={{ marginTop: 6 }}><span style={{ width: (n / colleges[0][1]) * 100 + '%' }} /></div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Students ---------- */
function Students({ s }) {
  const [q, setQ] = useState('');
  const [f, setF] = useState('all');
  const [open, setOpen] = useState(null);
  const [limit, setLimit] = useState(25);
  const list = s.students.filter((x) => x.profile)
    .filter((x) => f === 'all' || (f === 'paid' && x.paid) || (f === 'unpaid' && !x.paid) || (f === 'in' && x.red.entry))
    .filter((x) => !q || (x.name + x.college + x.passId + x.email + x.dept).toLowerCase().includes(q.toLowerCase()));
  const sel = open && s.students.find((x) => x.id === open);
  return (
    <>
      <h1 className="title">Students</h1>
      <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>{list.length} shown</p>
      <div className="field" style={{ marginTop: 18 }}>
        <span style={{ paddingLeft: 14, color: '#8A8A94', display: 'flex' }}><Icon n="search" size={18} /></span>
        <label htmlFor="sq" className="sr">Search students</label>
        <input id="sq" placeholder="Name, college or pass ID" value={q} onChange={(e) => { setQ(e.target.value); setLimit(25); }} style={{ paddingLeft: 10 }} />
      </div>
      <div className="chips" style={{ marginTop: 10 }}>
        {[['all', 'All'], ['paid', 'Paid'], ['unpaid', 'Not paid'], ['in', 'Checked in']].map(([k, l]) => <button key={k} className={'chip' + (f === k ? ' on' : '')} aria-pressed={f === k} onClick={() => { setF(k); setLimit(25); }}>{l}</button>)}
      </div>
      <div className="list" style={{ marginTop: 12 }}>
        {list.slice(0, limit).map((x) => (
          <button key={x.id} className="lrow" onClick={() => setOpen(x.id)}>
            <span className="avatar" style={{ width: 38, height: 38, fontSize: 12, background: x.id === 'me' ? '#2B2BEA' : '#121217' }}>{initials(x.name)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t ellipsis">{x.name}</div>
              <div className="s ellipsis">{x.college}, {x.dept}</div>
            </div>
            {x.red.entry ? <span className="pill green">In</span> : x.paid ? <span className="pill grey">Paid</span> : <span className="pill amber">Unpaid</span>}
          </button>
        ))}
        {!list.length && <p className="muted" style={{ padding: '20px 0', textAlign: 'center', fontSize: 14 }}>No students match. Try another search.</p>}
      </div>
      {list.length > limit && <button className="btn light block sm" style={{ marginTop: 10, height: 44 }} onClick={() => setLimit(limit + 25)}>Show more ({list.length - limit} left)</button>}

      {sel && (
        <Sheet label={sel.name} onClose={() => setOpen(null)}>
          <div className="between"><span className="avatar" style={{ width: 52, height: 52, fontSize: 17 }}>{initials(sel.name)}</span><button className="iconbtn" style={{ background: '#F2F2F4' }} onClick={() => setOpen(null)} aria-label="Close"><Icon n="close" size={18} /></button></div>
          <h2 className="serif" style={{ fontSize: 30, marginTop: 14 }}>{sel.name}</h2>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>{sel.dept}, {sel.college}</p>
          <div style={{ display: 'grid', gap: 10, marginTop: 18, fontSize: 14 }}>
            {[['Pass ID', sel.passId], ['Pass', sel.paid ? (sel.tier === 'creator' ? 'Creator pass' : 'Day pass') : 'Not purchased'], ['Payment', sel.paid ? money(sel.amount) + ' via ' + sel.payMethod : 'Pending'], ['Code used', sel.code || 'None'], ['Contact', '+91 ' + sel.phone]].map(([k, v]) => (
              <div key={k} className="between"><span className="muted">{k}</span><span>{v}</span></div>
            ))}
          </div>
          <h3 className="h2" style={{ marginTop: 22 }}>Redemptions</h3>
          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            {STATIONS.map((st) => (
              <div key={st.id} className="between" style={{ padding: '12px 14px', borderRadius: 14, background: '#F7F7F8', fontSize: 14 }}>
                <span className="row" style={{ gap: 8 }}><Icon n={st.icon} size={17} />{st.label}</span>
                {sel.red[st.id] ? <span className="pill green">{clock(sel.red[st.id])}</span> : <span className="muted">Not yet</span>}
              </div>
            ))}
          </div>
          {Object.keys(sel.red).length > 0 && <button className="btn light block sm" style={{ marginTop: 14, height: 44 }} onClick={() => { act.resetRedemptions(sel.id); toast('Redemptions cleared for ' + sel.name + '.'); }}>Clear redemptions</button>}
        </Sheet>
      )}
    </>
  );
}

/* ---------- Q&A moderation ---------- */
function QA({ s }) {
  const [tab, setTab] = useState('pending');
  const [sid, setSid] = useState('all');
  const qs = s.questions.filter((q) => q.status === tab && (sid === 'all' || q.sessionId === sid)).sort((a, b) => (b.pinned - a.pinned) || (b.votes - a.votes));
  const count = (st) => s.questions.filter((q) => q.status === st).length;
  return (
    <>
      <h1 className="title">Q&amp;A</h1>
      <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>Students only see approved questions.</p>
      <div className="seg" style={{ marginTop: 18 }}>
        {['pending', 'approved', 'rejected'].map((t) => <button key={t} className={tab === t ? 'on' : ''} aria-pressed={tab === t} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)} {count(t)}</button>)}
      </div>
      <div className="chips" style={{ marginTop: 10 }}>
        <button className={'chip' + (sid === 'all' ? ' on' : '')} onClick={() => setSid('all')}>All sessions</button>
        {s.sessions.filter((x) => x.kind !== 'live').map((x) => <button key={x.id} className={'chip' + (sid === x.id ? ' on' : '')} onClick={() => setSid(x.id)}>{x.title}</button>)}
      </div>
      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        {qs.map((q) => {
          const sess = s.sessions.find((x) => x.id === q.sessionId);
          return (
            <div key={q.id} className="card" style={{ padding: 16 }}>
              <div className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 44, textAlign: 'center', flexShrink: 0, padding: '6px 0', borderRadius: 12, background: '#F2F2F4' }}><div className="num" style={{ fontSize: 17, fontWeight: 600 }}>{q.votes}</div><div className="muted" style={{ fontSize: 11 }}>votes</div></div>
                <div style={{ flex: 1 }}>
                  {q.pinned && <span className="pill dark" style={{ marginBottom: 6 }}>Pinned</span>}
                  <p style={{ fontSize: 15, lineHeight: 1.45 }}>{q.text}</p>
                  <p className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>{q.author}, {clock(q.at)}{sess ? ', ' + sess.title : ''}</p>
                </div>
              </div>
              <div className="row" style={{ gap: 6, marginTop: 14 }}>
                {q.status !== 'approved' && <button className="btn sm" style={{ flex: 1, background: '#12805C', color: '#fff' }} onClick={() => { act.moderate(q.id, { status: 'approved' }); toast('Approved. Students can see it now.'); }}>Approve</button>}
                {q.status !== 'rejected' && <button className="btn light sm" style={{ flex: 1 }} onClick={() => { act.moderate(q.id, { status: 'rejected', pinned: false }); toast('Rejected.'); }}>Reject</button>}
                {q.status === 'approved' && <button className="btn light sm" style={{ flex: 1 }} onClick={() => act.moderate(q.id, { pinned: !q.pinned })}><Icon n="pin" size={15} />{q.pinned ? 'Unpin' : 'Pin'}</button>}
                <button className="iconbtn" style={{ background: '#F2F2F4', width: 38, height: 38 }} aria-label="Remove question" onClick={() => { act.removeQuestion(q.id); toast('Question removed.'); }}><Icon n="trash" size={16} /></button>
              </div>
            </div>
          );
        })}
        {!qs.length && <div className="card muted" style={{ padding: 24, textAlign: 'center', fontSize: 14 }}>{tab === 'pending' ? 'Nothing waiting. New questions from students land here.' : 'No ' + tab + ' questions yet.'}</div>}
      </div>
    </>
  );
}

/* ---------- Lucky E-Dip ---------- */
function EDip({ s }) {
  const [stage, setStage] = useState(false);
  const pool = act.eligible(s);
  return (
    <>
      <h1 className="title">Lucky E-Dip</h1>
      <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>Draws only from checked-in attendees. Each person wins once.</p>
      <section className="foil" style={{ marginTop: 18, borderRadius: 30, padding: 22, boxShadow: '0 28px 44px -30px rgba(43,43,234,.5)' }}>
        <div style={{ fontSize: 14, color: '#3F3F4A' }}>Eligible right now</div>
        <div className="num" style={{ fontSize: 72, fontWeight: 600, letterSpacing: '-0.05em', lineHeight: 1, marginTop: 6 }}>{pool.length}</div>
        <label className="label" htmlFor="prize" style={{ marginTop: 18 }}>Prize for this draw</label>
        <div className="field" style={{ background: 'rgba(255,255,255,.85)', borderColor: 'transparent' }}><input id="prize" value={s.prize} onChange={(e) => act.setPrize(e.target.value.slice(0, 40))} /></div>
        <button className="btn dark block" style={{ marginTop: 12, height: 54, borderRadius: 18 }} disabled={!pool.length || !s.prize.trim()} onClick={() => setStage(true)}><Icon n="play" size={18} />Open stage screen</button>
        <p style={{ fontSize: 13, color: '#3F3F4A', marginTop: 10, lineHeight: 1.5 }}>Cast your phone to the projector, then press Draw.</p>
      </section>
      <div className="section"><h2 className="h2">Winners</h2><span className="muted" style={{ fontSize: 13 }}>{s.winners.length}</span></div>
      <div className="list">
        {s.winners.map((w) => (
          <div key={w.at} className="lrow">
            <span style={{ width: 38, height: 38, borderRadius: 999, background: '#E8E8FF', color: '#2B2BEA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon n="gift" size={18} /></span>
            <div style={{ flex: 1, minWidth: 0 }}><div className="t ellipsis">{w.name}</div><div className="s ellipsis">{w.prize}, {w.college}</div></div>
            <span className="muted num" style={{ fontSize: 12.5 }}>{clock(w.at)}</span>
          </div>
        ))}
        {!s.winners.length && <p className="muted" style={{ padding: '18px 0', textAlign: 'center', fontSize: 14 }}>No draws yet.</p>}
      </div>
      {stage && <Stage s={s} onClose={() => setStage(false)} />}
    </>
  );
}

function Stage({ s, onClose }) {
  const [phase, setPhase] = useState('ready');
  const [name, setName] = useState('Who’s it going to be?');
  const [win, setWin] = useState(null);
  const timers = useRef([]);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', k);
    return () => { window.removeEventListener('keydown', k); timers.current.forEach(clearTimeout); };
  }, []);
  const draw = () => {
    const pool = act.eligible();
    if (!pool.length) return;
    setPhase('rolling'); setWin(null);
    const winner = act.draw();
    let delay = 40, t = 0;
    for (let i = 0; i < 34; i++) {
      t += delay; delay *= 1.07;
      const last = i === 33;
      timers.current.push(setTimeout(() => {
        if (last) { setName(winner.name); setWin(winner); setPhase('won'); }
        else setName(pool[Math.floor(Math.random() * pool.length)].name);
      }, t));
    }
  };
  const lit = { night: 0.95, beams: phase === 'won' ? 1 : 0.5, bulbs: 1, screen: 1, phones: phase === 'won' ? 1 : 0.4, confetti: 0 };
  return createPortal(
    <div className="stage" role="dialog" aria-label="Lucky E-Dip stage screen">
      <div className="art" dangerouslySetInnerHTML={{ __html: stageArt(lit) }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#120D3A 30%, rgba(18,13,58,0) 55%)' }} />
      {phase === 'won' && <Confetti n={60} />}
      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '20px 20px' }}>
        <Logo light />
        <button className="iconbtn" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }} onClick={onClose} aria-label="Close stage screen"><Icon n="close" size={18} /></button>
      </div>
      <div style={{ position: 'relative', marginTop: '5vh', padding: '0 20px', width: '100%' }}>
        <div style={{ fontSize: 'clamp(14px, 1.6vw, 20px)', color: '#C9C2F0' }}>Lucky E-Dip, drawing for</div>
        <div className="serif" style={{ fontSize: 'clamp(26px, 4vw, 54px)', marginTop: 8, color: '#FFE2B8' }}>{s.prize}</div>
        <div className="serif" aria-live="polite" style={{ fontSize: 'clamp(44px, 9vw, 132px)', lineHeight: 1.02, marginTop: '5vh', minHeight: '2.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: phase === 'won' ? 'italic' : 'normal' }}>{name}</div>
        {win && <div className="in" style={{ fontSize: 'clamp(15px, 2vw, 26px)', marginTop: 10, color: '#DAD5FF' }}>{win.college}, pass {win.passId}</div>}
        <div style={{ marginTop: '4vh' }}>
          {phase !== 'rolling' && <button className="btn" style={{ background: '#fff', color: '#121217', height: 56, padding: '0 32px', borderRadius: 999 }} onClick={draw}>{phase === 'won' ? 'Draw again' : 'Draw'}</button>}
        </div>
      </div>
    </div>,
    document.body
  );
}

// Same festival scene, with the sky taken fully to night for the stage screen.
const stageArt = (lit) => illustration(lit)
  .replace('<stop offset="0" stop-color="#FFFFFF" stop-opacity="0"></stop><stop offset="0.28" stop-color="#ECE8FF" stop-opacity="1"></stop><stop offset="0.55" stop-color="#C9BCF6"></stop>', '<stop offset="0" stop-color="#120D3A"></stop><stop offset="0.28" stop-color="#120D3A"></stop><stop offset="0.55" stop-color="#2A1F7A"></stop>');

/* ---------- More ---------- */
function More({ s, open, onLogout }) {
  const active = s.promos.filter((p) => p.active).length;
  const rows = [
    { id: 'promos', icon: 'tag', t: 'Promo codes', sub: active + ' active codes' },
    { id: 'schedule', icon: 'calendar', t: 'Schedule', sub: s.sessions.length + ' sessions across 2 days' },
    { id: 'volunteers', icon: 'shield', t: 'Volunteers', sub: s.volunteers.length + ' volunteers and their stations' },
  ];
  return (
    <>
      <h1 className="title">More</h1>
      <div className="list" style={{ marginTop: 18 }}>
        {rows.map((r) => (
          <button key={r.id} className="lrow" onClick={() => open(r.id)}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: '#F2F2F4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon n={r.icon} size={19} /></span>
            <div style={{ flex: 1 }}><div className="t">{r.t}</div><div className="s">{r.sub}</div></div>
            <Icon n="chevron" size={18} color="#8A8A94" />
          </button>
        ))}
      </div>
      <div className="section"><h2 className="h2">Event</h2></div>
      <div className="card" style={{ padding: 18 }}>
        <div className="between">
          <div><div style={{ fontSize: 15, fontWeight: 600 }}>{s.eventEnded ? 'Event has ended' : 'Event is live'}</div><div className="muted" style={{ fontSize: 13, marginTop: 2 }}>Ending it releases workshop certificates.</div></div>
          <button className={'switch' + (s.eventEnded ? '' : ' on')} role="switch" aria-checked={!s.eventEnded} aria-label="Event live" onClick={() => { act.setEnded(!s.eventEnded); toast(s.eventEnded ? 'Event is live again.' : 'Event ended. Certificates are now available to eligible students.'); }} />
        </div>
      </div>
      <div style={{ display: 'grid', gap: 8, marginTop: 22 }}>
        <button className="btn light block" onClick={onLogout}><Icon n="logout" size={18} />Sign out</button>
        <button className="btn ghost block sm" style={{ color: '#6E6E78' }} onClick={() => { if (confirm('Reset all demo data for every role?')) { act.reset(); toast('Demo data reset.'); } }}>Reset demo data</button>
      </div>
    </>
  );
}

function Field({ id, label, ...p }) {
  return <div><label className="label" htmlFor={id}>{label}</label><div className="field"><input id={id} {...p} /></div></div>;
}

function Promos({ s }) {
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ code: '', pct: '15', limit: '100', expires: '2026-12-11' });
  const [err, setErr] = useState('');
  const create = () => {
    const code = f.code.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,14}$/.test(code)) return setErr('Use 4 to 14 letters or numbers, no spaces.');
    if (s.promos.some((p) => p.code === code)) return setErr('That code already exists.');
    const pct = Number(f.pct), limit = Number(f.limit);
    if (!(pct > 0 && pct <= 90)) return setErr('Discount must be between 1 and 90 percent.');
    if (!(limit > 0)) return setErr('Usage limit must be at least 1.');
    act.addPromo({ code, pct, limit, expires: f.expires });
    setF({ ...f, code: '' }); setErr(''); setAdding(false);
    toast(code + ' created. Students can use it at checkout now.');
  };
  return (
    <>
      <div className="between" style={{ alignItems: 'flex-end' }}><h1 className="title">Promo codes</h1><button className="iconbtn dark" aria-label="New code" onClick={() => setAdding(true)}><Icon n="plus" size={19} /></button></div>
      <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
        {s.promos.map((p) => {
          const used = promoUses(s, p.code);
          const rev = s.students.filter((x) => x.paid && x.code === p.code).reduce((n, x) => n + x.amount, 0);
          return (
            <div key={p.code} className={p.owner ? 'foil' : 'card'} style={{ borderRadius: 24, padding: 18, opacity: p.active ? 1 : 0.65 }}>
              <div className="between">
                <div><div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '0.04em' }}>{p.code}</div><div style={{ fontSize: 13, color: '#4A4A55', marginTop: 2 }}>{p.pct}% off{p.owner ? ', ' + p.owner + '’s referral' : ''}, ends {new Date(p.expires + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div></div>
                <button className={'switch' + (p.active ? ' on' : '')} role="switch" aria-checked={p.active} aria-label={'Activate ' + p.code} onClick={() => { act.togglePromo(p.code); toast(p.code + (p.active ? ' turned off.' : ' turned on.')); }} />
              </div>
              <div style={{ height: 6, borderRadius: 999, background: p.owner ? 'rgba(255,255,255,.7)' : '#EFEFF3', marginTop: 14, overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 999, background: '#121217', width: Math.min(100, (used / p.limit) * 100) + '%' }} /></div>
              <div className="between" style={{ fontSize: 13, marginTop: 8, color: '#4A4A55' }}><span className="num">{used} of {p.limit} used</span><span className="num">{money(rev)} revenue</span></div>
            </div>
          );
        })}
      </div>
      {adding && (
        <Sheet label="New promo code" onClose={() => setAdding(false)}>
          <h2 className="serif" style={{ fontSize: 28 }}>New promo code</h2>
          <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
            <Field id="pcode" label="Code" placeholder="FRESHERS15" value={f.code} style={{ textTransform: 'uppercase' }} onChange={(e) => { setF({ ...f, code: e.target.value }); setErr(''); }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field id="ppct" label="Discount %" type="number" value={f.pct} onChange={(e) => setF({ ...f, pct: e.target.value })} />
              <Field id="plim" label="Usage limit" type="number" value={f.limit} onChange={(e) => setF({ ...f, limit: e.target.value })} />
            </div>
            <Field id="pexp" label="Expires on" type="date" value={f.expires} onChange={(e) => setF({ ...f, expires: e.target.value })} />
          </div>
          {err && <p className="error" role="alert">{err}</p>}
          <button className="btn dark block" style={{ marginTop: 18 }} onClick={create}>Create code</button>
        </Sheet>
      )}
    </>
  );
}

function Schedule({ s }) {
  const blank = { title: '', kind: 'workshop', day: 1, start: '15:00', end: '16:00', speaker: '', place: 'Studio A' };
  const [f, setF] = useState(blank);
  const [adding, setAdding] = useState(false);
  const [day, setDay] = useState(1);
  const add = () => {
    if (f.title.trim().length < 3 || f.speaker.trim().length < 2) return toast('Add a title and a speaker.');
    act.addSession({ ...f, day: Number(f.day), title: f.title.trim(), speaker: f.speaker.trim(), desc: '' });
    setF(blank); setAdding(false); toast('Session added. Students see it in their schedule now.');
  };
  return (
    <>
      <div className="between" style={{ alignItems: 'flex-end' }}><h1 className="title">Schedule</h1><button className="iconbtn dark" aria-label="Add session" onClick={() => setAdding(true)}><Icon n="plus" size={19} /></button></div>
      <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>Changes reach every student’s app instantly.</p>
      <div className="seg" style={{ marginTop: 18 }}>
        <button className={day === 1 ? 'on' : ''} onClick={() => setDay(1)}>Sat 12 Dec</button>
        <button className={day === 2 ? 'on' : ''} onClick={() => setDay(2)}>Sun 13 Dec</button>
      </div>
      <div className="list" style={{ marginTop: 12 }}>
        {s.sessions.filter((x) => x.day === day).sort((a, b) => a.start.localeCompare(b.start)).map((x) => (
          <div key={x.id} className="lrow" style={{ alignItems: 'flex-start' }}>
            <div className="num" style={{ width: 48, flexShrink: 0, fontSize: 15, fontWeight: 600 }}>{x.start}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t">{x.title}</div>
              <div className="s">{x.speaker}, {x.place}</div>
              <div className="row" style={{ gap: 6, marginTop: 10 }}>
                {s.liveId === x.id ? <span className="pill blue"><span className="dot pulse" />Live now</span>
                  : <button className="btn light sm" style={{ height: 32 }} onClick={() => { act.setLive(x.id); toast(x.title + ' is now live for students.'); }}>Mark live</button>}
              </div>
            </div>
            <button className="iconbtn" style={{ background: '#F2F2F4', width: 36, height: 36 }} aria-label={'Delete ' + x.title} onClick={() => { if (confirm('Delete ' + x.title + '?')) act.removeSession(x.id); }}><Icon n="trash" size={16} /></button>
          </div>
        ))}
      </div>
      {adding && (
        <Sheet label="Add session" onClose={() => setAdding(false)}>
          <h2 className="serif" style={{ fontSize: 28 }}>Add a session</h2>
          <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
            <Field id="nt" label="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
            <Field id="ns" label="Speaker" value={f.speaker} onChange={(e) => setF({ ...f, speaker: e.target.value })} />
            <Field id="np" label="Location" value={f.place} onChange={(e) => setF({ ...f, place: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field id="nst" label="Starts" type="time" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} />
              <Field id="nen" label="Ends" type="time" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} />
            </div>
            <div><span className="label">Type</span><div className="seg">{[['workshop', 'Workshop'], ['talk', 'Talk'], ['live', 'Live set']].map(([k, l]) => <button key={k} className={f.kind === k ? 'on' : ''} onClick={() => setF({ ...f, kind: k })}>{l}</button>)}</div></div>
            <div><span className="label">Day</span><div className="seg">{[[1, 'Sat 12 Dec'], [2, 'Sun 13 Dec']].map(([k, l]) => <button key={k} className={Number(f.day) === k ? 'on' : ''} onClick={() => setF({ ...f, day: k })}>{l}</button>)}</div></div>
          </div>
          <button className="btn dark block" style={{ marginTop: 18 }} onClick={add}>Save session</button>
        </Sheet>
      )}
    </>
  );
}

function Volunteers({ s }) {
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ name: '', email: '' });
  const add = () => {
    if (f.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) return toast('Add a name and a valid email.');
    if (s.volunteers.some((v) => v.email === f.email.trim().toLowerCase())) return toast('That volunteer already exists.');
    act.addVolunteer({ name: f.name.trim(), email: f.email.trim().toLowerCase() });
    setF({ name: '', email: '' }); setAdding(false); toast('Volunteer added with entry scanning.');
  };
  return (
    <>
      <div className="between" style={{ alignItems: 'flex-end' }}><h1 className="title">Volunteers</h1><button className="iconbtn dark" aria-label="Add volunteer" onClick={() => setAdding(true)}><Icon n="plus" size={19} /></button></div>
      <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>Tap a station to allow or block it. Their scanner updates instantly.</p>
      <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
        {s.volunteers.map((v) => (
          <div key={v.email} className="card" style={{ padding: 18 }}>
            <div className="row">
              <span className="avatar" style={{ width: 40, height: 40, fontSize: 13 }}>{initials(v.name)}</span>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 600 }}>{v.name}</div><div className="muted ellipsis" style={{ fontSize: 13 }}>{v.email}</div></div>
              <span className="muted num" style={{ fontSize: 13 }}>{s.scans.filter((x) => x.by === v.name).length} scans</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
              {STATIONS.map((st) => {
                const on = v.perms.includes(st.id);
                return <button key={st.id} className={'chip' + (on ? ' on' : ' outline')} style={{ height: 34, fontSize: 13 }} aria-pressed={on} onClick={() => act.togglePerm(v.email, st.id)}>{on ? <Icon n="check" size={13} sw={2.6} /> : <Icon n="lock" size={13} sw={2.2} />}{st.short}</button>;
              })}
            </div>
          </div>
        ))}
      </div>
      {adding && (
        <Sheet label="Add volunteer" onClose={() => setAdding(false)}>
          <h2 className="serif" style={{ fontSize: 28 }}>Add a volunteer</h2>
          <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
            <Field id="vn" label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            <Field id="ve" label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </div>
          <button className="btn dark block" style={{ marginTop: 18 }} onClick={add}>Add volunteer</button>
        </Sheet>
      )}
    </>
  );
}
