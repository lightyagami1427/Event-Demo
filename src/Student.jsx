import { useState } from 'react';
import { useStore, act, me as getMe, PRICES, TIERS, STATIONS, COLLEGES, INTERESTS } from './store.js';
import { Icon, Logo, QR, Toaster, toast, Sheet, money, clock, initials, ampm, Spinner, Confetti } from './ui.jsx';

const KIND = { workshop: { label: 'Workshop', color: '#2B2BEA' }, talk: { label: 'Talk', color: '#E8742F' }, live: { label: 'Live set', color: '#9B7BFF' } };

export default function Student({ session, onLogout }) {
  const s = useStore();
  const me = getMe(s);
  const [tab, setTab] = useState('pass');
  const [editing, setEditing] = useState(false);

  if (!me.profile || editing) return <Profile me={me} session={session} editing={editing} onDone={() => { setEditing(false); window.scrollTo(0, 0); }} />;
  if (!me.paid) return <Checkout me={me} />;

  const tabs = [
    { id: 'pass', label: 'Pass', icon: 'pass' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar' },
    { id: 'qa', label: 'Q&A', icon: 'chat' },
    { id: 'me', label: 'Profile', icon: 'user' },
  ];
  const go = (id) => { setTab(id); window.scrollTo(0, 0); };
  return (
    <div className="mobile">
      {tab === 'pass' && <PassTab s={s} me={me} go={go} />}
      {tab === 'schedule' && <ScheduleTab s={s} me={me} />}
      {tab === 'qa' && <QATab s={s} me={me} />}
      {tab === 'me' && <MeTab s={s} me={me} onEdit={() => setEditing(true)} onLogout={onLogout} />}
      <nav className="tabbar" aria-label="Main">
        {tabs.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} aria-current={tab === t.id ? 'page' : undefined} onClick={() => go(t.id)}>
            <Icon n={t.icon} />{t.label}
          </button>
        ))}
      </nav>
      <Toaster />
    </div>
  );
}

function Steps({ n }) {
  return (
    <div className="row" style={{ gap: 6 }} aria-label={'Step ' + n + ' of 2'}>
      {[1, 2].map((i) => <span key={i} style={{ height: 4, flex: 1, borderRadius: 4, background: i <= n ? '#121217' : '#E4E4E9' }} />)}
    </div>
  );
}

/* ---------- Profile setup ---------- */
function Profile({ me, session, editing, onDone }) {
  const fromEmail = session.email && session.email.includes('@') ? session.email : '';
  const [f, setF] = useState({
    name: me.name || '', college: me.college || '', dept: me.dept || '',
    phone: me.phone || (fromEmail ? '' : (session.email || '').replace(/\D/g, '').slice(-10)),
    interests: me.interests || [],
  });
  const [err, setErr] = useState({});
  const upd = (k, v) => { setF((x) => ({ ...x, [k]: v })); setErr((e) => ({ ...e, [k]: '' })); };
  const toggleI = (i) => upd('interests', f.interests.includes(i) ? f.interests.filter((x) => x !== i) : f.interests.length < 3 ? [...f.interests, i] : f.interests);
  const save = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = 'Enter your full name as it should appear on your certificate.';
    if (!f.college) e.college = 'Choose your college.';
    if (f.dept.trim().length < 2) e.dept = 'Enter your department.';
    if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = 'Enter a 10-digit mobile number.';
    if (!f.interests.length) e.interests = 'Pick at least one.';
    setErr(e);
    if (Object.keys(e).length) return;
    act.saveProfile({ ...f, name: f.name.trim(), dept: f.dept.trim(), email: fromEmail || me.email });
    if (editing) toast('Profile updated.');
    onDone();
  };
  return (
    <div className="mobile white">
      <div className="page in" style={{ paddingBottom: 40 }}>
        <div className="between" style={{ height: 44 }}>
          {editing ? <button className="iconbtn" style={{ border: '1px solid #E7E7EB' }} onClick={onDone} aria-label="Cancel"><Icon n="back" /></button> : <Logo />}
          {!editing && <span className="muted" style={{ fontSize: 13 }}>Step 1 of 2</span>}
        </div>
        {!editing && <div style={{ marginTop: 16 }}><Steps n={1} /></div>}
        <h1 className="serif" style={{ fontSize: 34, lineHeight: 1.1, marginTop: 26 }}>{editing ? 'Edit your profile' : 'Tell us about you'}</h1>
        <p className="muted" style={{ fontSize: 15, marginTop: 8, lineHeight: 1.5 }}>This goes on your pass and your workshop certificates.</p>

        <div style={{ display: 'grid', gap: 18, marginTop: 26 }}>
          <div>
            <label className="label" htmlFor="nm">Full name</label>
            <div className={'field' + (err.name ? ' err' : '')}><input id="nm" autoComplete="name" placeholder="Aanya Rao" value={f.name} onChange={(e) => upd('name', e.target.value.slice(0, 50))} /></div>
            {err.name && <p className="error">{err.name}</p>}
          </div>
          <div>
            <label className="label" htmlFor="cl">College</label>
            <div className={'field' + (err.college ? ' err' : '')}>
              <select id="cl" value={f.college} onChange={(e) => upd('college', e.target.value)} style={{ color: f.college ? '#121217' : '#A1A1AA' }}>
                <option value="">Choose your college</option>
                {COLLEGES.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other</option>
              </select>
            </div>
            {err.college && <p className="error">{err.college}</p>}
          </div>
          <div>
            <label className="label" htmlFor="dp">Department</label>
            <div className={'field' + (err.dept ? ' err' : '')}><input id="dp" placeholder="Applied Arts" value={f.dept} onChange={(e) => upd('dept', e.target.value.slice(0, 50))} /></div>
            {err.dept && <p className="error">{err.dept}</p>}
          </div>
          <div>
            <label className="label" htmlFor="ct">Contact number</label>
            <div className={'field' + (err.phone ? ' err' : '')}><span className="pre">+91</span><input id="ct" type="tel" inputMode="numeric" placeholder="98765 43210" value={f.phone} onChange={(e) => upd('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} /></div>
            {err.phone && <p className="error">{err.phone}</p>}
          </div>
          <div>
            <div className="between"><span className="label" id="ci">What do you like to create?</span><span className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>Up to 3</span></div>
            <div role="group" aria-labelledby="ci" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {INTERESTS.map((i) => {
                const on = f.interests.includes(i);
                return <button key={i} className={'chip' + (on ? ' on' : ' outline')} aria-pressed={on} onClick={() => toggleI(i)}>{on && <Icon n="check" size={14} sw={2.6} />}{i}</button>;
              })}
            </div>
            {err.interests && <p className="error">{err.interests}</p>}
          </div>
        </div>
        <button className="btn dark block" style={{ marginTop: 30 }} onClick={save}>{editing ? 'Save changes' : 'Continue to passes'}</button>
      </div>
      <Toaster bottom={30} />
    </div>
  );
}

/* ---------- Checkout ---------- */
function Checkout({ me }) {
  const [tier, setTier] = useState('creator');
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null);
  const [codeErr, setCodeErr] = useState('');
  const [pay, setPay] = useState(false);
  const base = PRICES[tier];
  const off = applied ? Math.round(base * applied.pct / 100) : 0;
  const total = base - off;
  const apply = () => {
    const r = act.checkCode(code);
    if (r.ok) { setApplied(r); setCodeErr(''); } else { setApplied(null); setCodeErr(r.msg); }
  };
  return (
    <div className="mobile white">
      <div className="page in" style={{ paddingBottom: 40 }}>
        <div className="between" style={{ height: 44 }}><Logo /><span className="muted" style={{ fontSize: 13 }}>Step 2 of 2</span></div>
        <div style={{ marginTop: 16 }}><Steps n={2} /></div>
        <h1 className="serif" style={{ fontSize: 34, lineHeight: 1.1, marginTop: 26 }}>Pick your pass, {me.name.split(' ')[0]}</h1>
        <p className="muted" style={{ fontSize: 15, marginTop: 8 }}>12–13 Dec, Hyderabad. One QR works for everything.</p>

        <div role="radiogroup" aria-label="Pass type" style={{ display: 'grid', gap: 10, marginTop: 24 }}>
          {['creator', 'day'].map((k) => {
            const on = tier === k;
            return (
              <button key={k} role="radio" aria-checked={on} onClick={() => setTier(k)} className={on ? 'foil' : ''}
                style={{ textAlign: 'left', border: on ? '1.5px solid #121217' : '1.5px solid #E4E4E9', background: on ? undefined : '#fff', borderRadius: 22, padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'border-color .2s' }}>
                <span style={{ width: 22, height: 22, borderRadius: 999, border: on ? '7px solid #121217' : '2px solid #C9C9D1', background: '#fff', flexShrink: 0, marginTop: 2, transition: 'border .15s' }} />
                <span style={{ flex: 1 }}>
                  <span className="between"><span style={{ fontSize: 17, fontWeight: 600 }}>{TIERS[k].name}</span><span style={{ fontSize: 17, fontWeight: 600 }}>{money(PRICES[k])}</span></span>
                  <span style={{ display: 'block', fontSize: 13.5, color: '#4A4A55', marginTop: 4, lineHeight: 1.4 }}>{TIERS[k].desc}</span>
                  {k === 'creator' && <span className="pill dark" style={{ marginTop: 10 }}>Most students pick this</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 22 }}>
          <label className="label" htmlFor="pc">Promo or referral code</label>
          <div className="row" style={{ gap: 8 }}>
            <div className={'field' + (codeErr ? ' err' : '')} style={{ flex: 1 }}>
              <input id="pc" placeholder="SPARK20" value={code} style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }} onChange={(e) => { setCode(e.target.value.slice(0, 20)); setCodeErr(''); }} onKeyDown={(e) => e.key === 'Enter' && apply()} />
            </div>
            <button className="btn light" style={{ height: 52 }} onClick={apply} disabled={!code.trim()}>Apply</button>
          </div>
          {codeErr && <p className="error" role="alert">{codeErr}</p>}
          {applied && (
            <div className="row in" style={{ marginTop: 10, padding: '10px 12px', borderRadius: 12, background: '#E3F4EC', color: '#0E6B4C', fontSize: 13.5, gap: 8 }}>
              <Icon n="check" size={16} sw={2.4} />
              <span style={{ flex: 1 }}>{applied.owner ? 'Referral from ' + applied.owner + ' applied, ' : applied.code + ' applied, '}{applied.pct}% off</span>
              <button className="link" style={{ color: '#0E6B4C', fontSize: 13 }} onClick={() => { setApplied(null); setCode(''); }}>Remove</button>
            </div>
          )}
          {!applied && !codeErr && <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>Try SPARK20 or the ambassador code RIYA10.</p>}
        </div>

        <div className="card" style={{ marginTop: 22, background: '#F7F7F8', padding: 18, display: 'grid', gap: 10, fontSize: 14.5 }}>
          <div className="between"><span className="muted">{TIERS[tier].name}</span><span className="num">{money(base)}</span></div>
          {applied && <div className="between"><span className="muted">Discount ({applied.code})</span><span className="num" style={{ color: '#0E6B4C' }}>−{money(off)}</span></div>}
          <div className="between" style={{ borderTop: '1px solid #E6E6EA', paddingTop: 12, fontSize: 17, fontWeight: 600 }}><span>Total</span><span className="num">{money(total)}</span></div>
        </div>
        <button className="btn dark block" style={{ marginTop: 16, height: 56 }} onClick={() => setPay(true)}>Pay {money(total)}</button>
        <p className="muted" style={{ fontSize: 12.5, textAlign: 'center', marginTop: 12 }}>Demo payment. No money is charged.</p>
      </div>
      {pay && <PaySheet total={total} onClose={() => setPay(false)} onPaid={(method) => act.purchase({ tier, code: applied && applied.code, pct: applied && applied.pct, method })} />}
    </div>
  );
}

function PaySheet({ total, onClose, onPaid }) {
  const [method, setMethod] = useState('UPI');
  const [phase, setPhase] = useState('choose');
  const go = () => {
    setPhase('paying');
    setTimeout(() => setPhase('paid'), 1600);
    setTimeout(() => onPaid(method), 3000);
  };
  return (
    <Sheet onClose={phase === 'choose' ? onClose : undefined} label="Payment">
      {phase === 'choose' && (
        <>
          <div className="between"><h2 className="h2">Pay {money(total)}</h2><button className="iconbtn" style={{ background: '#F2F2F4' }} onClick={onClose} aria-label="Close"><Icon n="close" size={18} /></button></div>
          <div role="radiogroup" aria-label="Payment method" style={{ display: 'grid', gap: 8, marginTop: 18 }}>
            {[['UPI', 'Google Pay, PhonePe, Paytm or any UPI app'], ['Card', 'Debit or credit card'], ['Net banking', 'All major Indian banks']].map(([m, d]) => (
              <button key={m} role="radio" aria-checked={method === m} onClick={() => setMethod(m)} style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, border: method === m ? '1.5px solid #121217' : '1.5px solid #E4E4E9', background: '#fff' }}>
                <span style={{ width: 20, height: 20, borderRadius: 999, border: method === m ? '6px solid #121217' : '2px solid #C9C9D1', flexShrink: 0 }} />
                <span><span style={{ display: 'block', fontWeight: 600, fontSize: 15 }}>{m}</span><span className="muted" style={{ fontSize: 13 }}>{d}</span></span>
              </button>
            ))}
          </div>
          <button className="btn dark block" style={{ marginTop: 18 }} onClick={go}>Pay {money(total)} with {method}</button>
        </>
      )}
      {phase !== 'choose' && (
        <div style={{ textAlign: 'center', padding: '24px 0 12px' }}>
          {phase === 'paying' ? (
            <>
              <div style={{ width: 72, height: 72, borderRadius: 999, background: '#F2F2F4', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Spinner color="#121217" /></div>
              <h2 className="serif" style={{ fontSize: 28, marginTop: 18 }}>Confirming payment</h2>
              <p className="muted" style={{ marginTop: 6 }}>Keep this screen open.</p>
            </>
          ) : (
            <>
              <div className="pop" style={{ width: 72, height: 72, borderRadius: 999, background: '#12805C', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="check" size={34} color="#fff" sw={2.6} /></div>
              <h2 className="serif" style={{ fontSize: 28, marginTop: 18 }}>Payment received</h2>
              <p className="muted" style={{ marginTop: 6 }}>{money(total)} paid. Your pass is ready.</p>
            </>
          )}
        </div>
      )}
    </Sheet>
  );
}

/* ---------- Pass ---------- */
function Header({ me }) {
  return (
    <div className="row">
      <div className="avatar">{initials(me.name)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Hi, {me.name.split(' ')[0]}</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 1 }}>{me.dept}, {me.college}</div>
      </div>
      <button className="iconbtn" aria-label="Notifications" onClick={() => toast('Doors open at 9:30 AM. Hall 3 has the shortest queue right now.')}>
        <Icon n="bell" size={19} />
        <span style={{ position: 'absolute', top: 10, right: 11, width: 7, height: 7, borderRadius: 999, background: '#2B2BEA' }} />
      </button>
    </div>
  );
}

function PassTab({ s, me, go }) {
  const [gate, setGate] = useState(false);
  const [scanning, setScanning] = useState(false);
  const inside = !!me.red.entry;
  const won = s.winners.find((w) => w.id === 'me');
  const live = s.sessions.find((x) => x.id === s.liveId);
  const next = s.sessions.filter((x) => x.day === (live ? live.day : 1) && x.start > (live ? live.start : '00:00')).slice(0, 1);
  const upNext = [live, ...next].filter(Boolean);

  const simulate = () => {
    setScanning(true);
    setTimeout(() => {
      const r = act.scan(me.passId, 'entry', 'Demo');
      setScanning(false);
      if (r.result === 'success') { setGate(false); toast('Checked in at Hall 3. Your goodie bag, stalls and digital perks are unlocked.'); }
      else toast('This pass is already checked in.');
    }, 1500);
  };

  return (
    <div className="page in">
      <Header me={me} />

      {won && (
        <div className="card row" style={{ marginTop: 18, padding: 16, background: '#121217', color: '#fff' }}>
          <span style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="gift" /></span>
          <span style={{ flex: 1, fontSize: 14, lineHeight: 1.45 }}><b>You won the Lucky E-Dip.</b> Collect your {won.prize} at the help desk.</span>
        </div>
      )}

      <section aria-label="Your event pass" className="foil" style={{ marginTop: 22, borderRadius: 30, padding: '22px 20px 20px', boxShadow: '0 1px 0 rgba(255,255,255,.9) inset, 0 28px 44px -30px rgba(43,43,234,.5)' }}>
        <div className="between">
          <div className="serif" style={{ fontSize: 28, lineHeight: 1 }}>Spark Fest</div>
          {inside
            ? <span className="pill" style={{ background: '#12805C', color: '#fff' }}><span className="dot" style={{ background: '#BFF0D9' }} />Checked in {clock(me.red.entry)}</span>
            : <span className="pill" style={{ background: 'rgba(255,255,255,.7)', color: '#3F3F4A' }}><span className="dot" style={{ background: '#E8892F' }} />Not checked in</span>}
        </div>
        <div style={{ fontSize: 13, color: '#3F3F4A', marginTop: 6 }}>{TIERS[me.tier].name}, {me.tier === 'creator' ? 'valid 12–13 Dec' : 'valid Sat 12 Dec'}</div>
        <div style={{ marginTop: 20, background: '#fff', borderRadius: 24, padding: '22px 22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <QR value={me.passId} size={200} />
          <div className="muted" style={{ marginTop: 14, fontSize: 13, fontWeight: 500, letterSpacing: '0.08em' }}>{me.passId}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 18 }}>
          {[['Name', me.name], ['Payment', 'Paid ' + money(me.amount)], ['Entry gate', 'Hall 3']].map(([k, v]) => (
            <div key={k} style={{ minWidth: 0 }}><div style={{ fontSize: 12, color: '#4A4A55' }}>{k}</div><div style={{ fontSize: 14, fontWeight: 600, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</div></div>
          ))}
        </div>
      </section>

      <div className="row" style={{ marginTop: 12, gap: 10 }}>
        <button className="btn dark" style={{ flex: 1, height: 54, borderRadius: 18 }} onClick={() => setGate(true)}><Icon n="scan" size={18} />Show at gate</button>
        <button className="btn" style={{ width: 54, height: 54, borderRadius: 18, padding: 0, background: '#fff' }} aria-label="Add pass to wallet" onClick={() => toast('Pass added to your phone wallet.')}><Icon n="wallet" /></button>
      </div>

      <section aria-label="Perks" style={{ marginTop: 26 }}>
        <div className="between" style={{ padding: '0 2px' }}><h2 className="h2">Perks</h2><span className="muted" style={{ fontSize: 13 }}>{inside ? 'One scan each' : 'Unlock when you check in'}</span></div>
        <div className="card" style={{ marginTop: 12, padding: '16px 8px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          {STATIONS.map((st) => {
            const used = me.red[st.id];
            const locked = !inside && st.id !== 'entry';
            const bg = used ? '#12805C' : locked ? '#F2F2F4' : st.id === 'entry' ? '#121217' : '#E8E8FF';
            const color = used || (!locked && st.id === 'entry') ? '#fff' : locked ? '#8A8A94' : '#2B2BEA';
            const msg = used ? st.label + ' used at ' + clock(used) + '. Each perk can be redeemed once.'
              : locked ? st.label + ' unlocks after you check in at the gate.'
                : st.id === 'entry' ? 'Show your QR at the Hall 3 gate to check in.'
                  : st.id === 'bag' ? 'Collect your goodie bag at Counter 2. A volunteer scans your QR.'
                    : st.id === 'stall' ? 'Stalls are open until 7 PM. Volunteers scan your QR at each one.'
                      : 'Show your QR at the perks desk to claim your digital rewards.';
            return (
              <button key={st.id} onClick={() => toast(msg)} aria-label={st.label + (used ? ', used' : locked ? ', locked' : ', ready')} style={{ border: 0, background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <span style={{ position: 'relative', width: 50, height: 50, borderRadius: 999, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .3s' }}>
                  <Icon n={used ? 'check' : st.icon} size={21} color={color} sw={used ? 2.4 : 1.8} />
                  {locked && <span style={{ position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="lock" size={11} color="#6E6E78" sw={2.6} /></span>}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 500 }}>{st.short}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label="Up next" style={{ marginTop: 26 }}>
        <div className="between" style={{ padding: '0 2px' }}><h2 className="h2">Up next</h2><button className="link" onClick={() => go('schedule')}>Full schedule</button></div>
        <div className="card" style={{ marginTop: 10, padding: '6px 18px' }}>
          {upNext.map((x, i) => <SessionRow key={x.id} x={x} me={me} live={x.id === s.liveId} first={i === 0} />)}
        </div>
      </section>

      {gate && (
        <Sheet full label="Pass for gate scan" onClose={() => setGate(false)}>
          <div className="between"><span style={{ fontSize: 14, fontWeight: 600 }}>Hall 3 gate</span><button className="iconbtn dark" onClick={() => setGate(false)} aria-label="Close"><Icon n="close" size={18} /></button></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div className="serif" style={{ fontSize: 40, lineHeight: 1 }}>{me.name}</div>
            <div style={{ fontSize: 14, color: '#3F3F4A', marginTop: 8 }}>{TIERS[me.tier].name}, {me.passId}</div>
            <div style={{ position: 'relative', marginTop: 28, width: 300, maxWidth: '100%', aspectRatio: '1', borderRadius: 30, background: '#fff', padding: 24, boxShadow: '0 30px 50px -30px rgba(43,43,234,.5)' }}>
              <QR value={me.passId} size="100%" />
              {scanning && <div style={{ position: 'absolute', inset: 14, borderRadius: 18, overflow: 'hidden' }}><div className="scanline" /></div>}
            </div>
            <p style={{ marginTop: 22, maxWidth: 280, fontSize: 14, lineHeight: 1.5, color: '#3F3F4A' }}>
              {scanning ? 'Scanning…' : inside ? 'You’re checked in. Volunteers scan this same code for your goodie bag, stalls and perks.' : 'Turn your brightness up and hold the phone flat under the scanner.'}
            </p>
          </div>
          {!inside && <button className="btn block" disabled={scanning} onClick={simulate} style={{ height: 44, marginBottom: 10, background: 'transparent', border: '1.5px dashed rgba(18,18,23,.3)', color: '#3F3F4A', fontSize: 13, fontWeight: 500 }}>Demo: simulate a gate scan</button>}
          <button className="btn dark block" style={{ height: 54, borderRadius: 18 }} onClick={() => setGate(false)}>Done</button>
        </Sheet>
      )}
    </div>
  );
}

function SessionRow({ x, me, live, first, expandable }) {
  const [open, setOpen] = useState(false);
  const saved = me.saved.includes(x.id);
  const t = ampm(x.start);
  const toggle = () => { act.toggleSave(x.id); toast(saved ? 'Removed from your schedule.' : 'Saved. We’ll remind you 10 minutes before ' + t.t + ' ' + t.p + '.'); };
  return (
    <div style={{ display: 'flex', gap: 14, padding: '14px 0', alignItems: 'flex-start', borderTop: first ? 0 : '1px solid #F1F1F4' }}>
      <div style={{ width: 52, flexShrink: 0 }}>
        <div className="num" style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{t.t}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 1 }}>{t.p}</div>
      </div>
      <span style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, background: KIND[x.kind].color }} />
      <button onClick={() => expandable && setOpen(!open)} aria-expanded={expandable ? open : undefined} style={{ flex: 1, minWidth: 0, textAlign: 'left', border: 0, background: 'none', padding: 0, cursor: expandable ? 'pointer' : 'default' }}>
        {live && <span className="pill blue" style={{ marginBottom: 6 }}><span className="dot pulse" style={{ background: '#2B2BEA' }} />Live now</span>}
        <span style={{ display: 'block', fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{x.title}</span>
        <span className="muted" style={{ display: 'block', fontSize: 13, marginTop: 3 }}>{KIND[x.kind].label} with {x.speaker}, {x.place}</span>
        {open && <span style={{ display: 'block', fontSize: 13.5, lineHeight: 1.5, marginTop: 8, color: '#4A4A55' }}>{x.desc}</span>}
      </button>
      <button onClick={toggle} aria-pressed={saved} aria-label={(saved ? 'Remove ' : 'Save ') + x.title} style={{ width: 40, height: 40, borderRadius: 999, border: 0, padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: saved ? '#121217' : '#F2F2F4', color: saved ? '#fff' : '#121217', transition: 'background .2s' }}>
        <Icon n={saved ? 'check' : 'bell'} size={17} sw={saved ? 2.4 : 1.9} />
      </button>
    </div>
  );
}

/* ---------- Schedule ---------- */
function ScheduleTab({ s, me }) {
  const [day, setDay] = useState(1);
  const [kind, setKind] = useState('all');
  const list = s.sessions.filter((x) => x.day === day && (kind === 'all' || x.kind === kind)).sort((a, b) => a.start.localeCompare(b.start));
  return (
    <div className="page in">
      <h1 className="serif" style={{ fontSize: 34, lineHeight: 1.1, marginTop: 8 }}>Schedule</h1>
      <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>Tap a session for details. Changes from the organisers show up here instantly.</p>
      <div className="seg" style={{ marginTop: 20 }}>
        <button className={day === 1 ? 'on' : ''} aria-pressed={day === 1} onClick={() => setDay(1)}>Sat 12 Dec</button>
        <button className={day === 2 ? 'on' : ''} aria-pressed={day === 2} onClick={() => setDay(2)}>Sun 13 Dec</button>
      </div>
      <div className="chips" style={{ marginTop: 12 }}>
        {[['all', 'All'], ['workshop', 'Workshops'], ['talk', 'Talks'], ['live', 'Live sets']].map(([k, l]) => (
          <button key={k} className={'chip' + (kind === k ? ' on' : '')} aria-pressed={kind === k} onClick={() => setKind(k)}>{l}</button>
        ))}
      </div>
      <div className="card" style={{ marginTop: 12, padding: '6px 18px' }}>
        {list.map((x, i) => <SessionRow key={x.id} x={x} me={me} live={x.id === s.liveId} first={i === 0} expandable />)}
        {!list.length && <p className="muted" style={{ padding: '22px 0', textAlign: 'center', fontSize: 14 }}>Nothing of this kind on this day. Try another filter.</p>}
      </div>
    </div>
  );
}

/* ---------- Q&A ---------- */
function QATab({ s, me }) {
  const qaSessions = s.sessions.filter((x) => x.kind !== 'live');
  const [sid, setSid] = useState(s.sessions.find((x) => x.id === s.liveId && x.kind !== 'live') ? s.liveId : qaSessions[0].id);
  const [text, setText] = useState('');
  const sess = s.sessions.find((x) => x.id === sid);
  const qs = s.questions
    .filter((q) => q.sessionId === sid && (q.status === 'approved' || (q.mine && q.status === 'pending')))
    .sort((a, b) => (b.pinned - a.pinned) || (b.votes - a.votes));
  const submit = () => {
    if (text.trim().length < 8) return toast('Write a full question so the speaker can answer it.');
    act.ask(sid, text.trim(), me.name.split(' ')[0] + ' ' + me.name.split(' ').slice(-1)[0][0] + '.');
    setText('');
    toast('Sent for review. It appears for everyone once a moderator approves it.');
  };
  return (
    <div className="page in">
      <h1 className="serif" style={{ fontSize: 34, lineHeight: 1.1, marginTop: 8 }}>Live Q&amp;A</h1>
      <div className="chips" style={{ marginTop: 16 }}>
        {qaSessions.map((x) => (
          <button key={x.id} className={'chip' + (sid === x.id ? ' on' : '')} aria-pressed={sid === x.id} onClick={() => setSid(x.id)}>
            {x.id === s.liveId && <span className="dot" style={{ width: 7, height: 7, borderRadius: 999, background: sid === x.id ? '#fff' : '#2B2BEA' }} />}{x.title}
          </button>
        ))}
      </div>
      <div className="card" style={{ marginTop: 14, padding: 18 }}>
        <div className="muted" style={{ fontSize: 13 }}>{sess.speaker}, {sess.place}</div>
        <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>{sess.title}</div>
        <label htmlFor="q" className="sr">Your question</label>
        <textarea id="q" className="area" rows={3} style={{ marginTop: 14 }} placeholder="Ask the speaker something" value={text} onChange={(e) => setText(e.target.value.slice(0, 240))} />
        <div className="between" style={{ marginTop: 10 }}>
          <span className="muted num" style={{ fontSize: 12.5 }}>{text.length}/240</span>
          <button className="btn dark sm" onClick={submit} disabled={!text.trim()}>Send question</button>
        </div>
      </div>
      <div className="between" style={{ margin: '24px 2px 10px' }}><h2 className="h2">Questions</h2><span className="muted" style={{ fontSize: 13 }}>Most upvoted first</span></div>
      <div style={{ display: 'grid', gap: 8 }}>
        {qs.map((q) => {
          const voted = q.voters.includes('me');
          const pending = q.status === 'pending';
          return (
            <div key={q.id} className="card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start', opacity: pending ? 0.8 : 1 }}>
              <button onClick={() => act.vote(q.id)} disabled={pending} aria-pressed={voted} aria-label={(voted ? 'Remove upvote, ' : 'Upvote, ') + q.votes + ' votes'}
                style={{ width: 48, borderRadius: 14, border: 0, padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: voted ? '#2B2BEA' : '#F2F2F4', color: voted ? '#fff' : '#121217', flexShrink: 0, transition: 'background .2s', cursor: pending ? 'not-allowed' : 'pointer' }}>
                <Icon n="up" size={16} sw={2.2} /><span className="num" style={{ fontSize: 14, fontWeight: 600 }}>{q.votes}</span>
              </button>
              <div style={{ flex: 1 }}>
                {(q.pinned || pending) && <span className={'pill ' + (pending ? 'amber' : 'dark')} style={{ marginBottom: 6 }}>{pending ? 'In review' : 'Pinned by host'}</span>}
                <p style={{ fontSize: 15, lineHeight: 1.45 }}>{q.text}</p>
                <p className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>{q.author}, {clock(q.at)}</p>
              </div>
            </div>
          );
        })}
        {!qs.length && <div className="card muted" style={{ padding: 22, textAlign: 'center', fontSize: 14 }}>No questions yet. Ask the first one.</div>}
      </div>
    </div>
  );
}

/* ---------- Profile, perks and certificates ---------- */
function downloadCert(me, x) {
  const c = document.createElement('canvas');
  c.width = 1600; c.height = 1130;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 1600, 1130);
  grad.addColorStop(0, '#DCD0FF'); grad.addColorStop(0.5, '#FFE2D0'); grad.addColorStop(1, '#C8EEFF');
  g.fillStyle = grad; g.fillRect(0, 0, 1600, 1130);
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(56, 56, 1488, 1018, 44); g.fill();
  g.fillStyle = '#121217';
  g.beginPath(); g.arc(140, 150, 26, 0, Math.PI * 2); g.fill();
  g.font = '600 34px Geist, sans-serif'; g.fillText('Spark Fest 2026', 182, 162);
  g.fillStyle = '#6E6E78'; g.font = '28px Geist, sans-serif'; g.fillText('Certificate of participation', 120, 330);
  g.fillStyle = '#121217'; g.font = 'italic 104px Newsreader, Georgia, serif'; g.fillText(me.name, 116, 460);
  g.fillStyle = '#4A4A55'; g.font = '30px Geist, sans-serif'; g.fillText('of ' + me.dept + ', ' + me.college + ', completed the workshop', 120, 540);
  g.fillStyle = '#121217'; g.font = '64px Newsreader, Georgia, serif'; g.fillText(x.title, 116, 640);
  g.fillStyle = '#4A4A55'; g.font = '30px Geist, sans-serif'; g.fillText('led by ' + x.speaker + ' on ' + (x.day === 1 ? '12' : '13') + ' December 2026, Hyderabad', 120, 700);
  g.strokeStyle = '#E4E4E9'; g.lineWidth = 2; g.beginPath(); g.moveTo(120, 900); g.lineTo(1480, 900); g.stroke();
  g.fillStyle = '#6E6E78'; g.font = '24px Geist, sans-serif';
  g.fillText('Certificate ID  ' + me.passId + '-' + x.id.toUpperCase(), 120, 960);
  g.fillText('Verified by attendance at the venue', 1060, 960);
  const a = document.createElement('a');
  a.download = 'SparkFest-certificate-' + x.title.replace(/\W+/g, '-') + '.png';
  a.href = c.toDataURL('image/png'); a.click();
  toast('Certificate downloaded.');
}

function MeTab({ s, me, onEdit, onLogout }) {
  const inside = !!me.red.entry;
  const workshops = s.sessions.filter((x) => x.kind === 'workshop' && me.saved.includes(x.id) && (me.tier === 'creator' || x.day === 1));
  return (
    <div className="page in">
      <div className="card" style={{ padding: 20 }}>
        <div className="row">
          <div className="avatar" style={{ width: 56, height: 56, fontSize: 18 }}>{initials(me.name)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="serif" style={{ fontSize: 26, lineHeight: 1.1 }}>{me.name}</div>
            <div className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>{me.dept}, {me.college}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 18, fontSize: 14 }}>
          <div className="between"><span className="muted">Contact</span><span>+91 {me.phone}</span></div>
          <div className="between"><span className="muted">Creates</span><span>{me.interests.join(', ')}</span></div>
          <div className="between"><span className="muted">Pass</span><span>{TIERS[me.tier].name}, paid {money(me.amount)}{me.payMethod ? ' via ' + me.payMethod : ''}</span></div>
        </div>
        <button className="btn light block sm" style={{ marginTop: 18, height: 44 }} onClick={onEdit}>Edit profile</button>
      </div>

      <div className="between" style={{ margin: '26px 2px 10px' }}><h2 className="h2">Workshop certificates</h2></div>
      <div className="card" style={{ padding: '6px 18px' }}>
        {!s.eventEnded && <p className="muted" style={{ padding: '16px 0', fontSize: 14, lineHeight: 1.5 }}>Certificates unlock after the event for students who checked in and joined a workshop. Save workshops to your schedule so we know which ones you attend.</p>}
        {s.eventEnded && !inside && <p className="muted" style={{ padding: '16px 0', fontSize: 14, lineHeight: 1.5 }}>Certificates go to students who checked in at the venue. We don’t have a check-in for this pass.</p>}
        {s.eventEnded && inside && !workshops.length && <p className="muted" style={{ padding: '16px 0', fontSize: 14, lineHeight: 1.5 }}>You didn’t join a workshop on your schedule, so there’s no certificate this time.</p>}
        {s.eventEnded && inside && workshops.map((x, i) => (
          <div key={x.id} className="row" style={{ padding: '14px 0', borderTop: i ? '1px solid #F1F1F4' : 0 }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: '#E8E8FF', color: '#2B2BEA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon n="shield" /></span>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 600 }}>{x.title}</div><div className="muted" style={{ fontSize: 13 }}>{x.speaker}</div></div>
            <button className="iconbtn dark" aria-label={'Download certificate for ' + x.title} onClick={() => downloadCert(me, x)}><Icon n="download" size={18} /></button>
          </div>
        ))}
      </div>

      <div className="between" style={{ margin: '26px 2px 10px' }}><h2 className="h2">Digital perks</h2></div>
      <div className="card" style={{ padding: 18, fontSize: 14, lineHeight: 1.5 }}>
        {me.red.perk
          ? <><span className="pill green">Claimed {clock(me.red.perk)}</span><p style={{ marginTop: 10 }}>Your workshop asset pack and partner discounts are in your email.</p></>
          : inside
            ? <p>Show your QR at the perks desk to claim the workshop asset pack and partner discounts.</p>
            : <p className="muted">Unlocks after you check in at the venue.</p>}
      </div>

      <div style={{ display: 'grid', gap: 8, marginTop: 26 }}>
        <button className="btn light block" onClick={onLogout}><Icon n="logout" size={18} />Sign out</button>
        <button className="btn ghost block sm" style={{ color: '#6E6E78' }} onClick={() => { if (confirm('Reset all demo data for every role?')) { act.reset(); toast('Demo data reset.'); } }}>Reset demo data</button>
      </div>
    </div>
  );
}
