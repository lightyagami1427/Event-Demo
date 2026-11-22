import { useState } from 'react';
import { useStore } from './store.js';
import { Icon, Toaster, toast, money, initials } from './ui.jsx';

const CODE = 'RIYA10';

export default function Ambassador({ onLogout }) {
  const s = useStore();
  const [tab, setTab] = useState('home');
  const refs = s.students.filter((x) => x.code === CODE).sort((a, b) => b.createdAt - a.createdAt);
  const paid = refs.filter((x) => x.paid);
  const revenue = paid.reduce((n, x) => n + x.amount, 0);
  const conv = refs.length ? Math.round((paid.length / refs.length) * 100) : 0;
  const link = 'https://sparkfest.in/r/' + CODE;
  const go = (t) => { setTab(t); window.scrollTo(0, 0); };

  const copy = () => { try { navigator.clipboard.writeText(link); } catch (e) { /* ignore */ } toast('Link copied. Share it anywhere.'); };
  const share = () => {
    if (navigator.share) navigator.share({ title: 'Spark Fest 2026', text: 'Get 10% off your Spark Fest pass with my code ' + CODE, url: link }).catch(() => {});
    else copy();
  };

  return (
    <div className="mobile">
      <div className="page in" key={tab}>
        <div className="row" style={{ marginBottom: 22 }}>
          <div className="avatar" style={{ background: 'conic-gradient(from 200deg, #C9B8FF, #FFD3B8, #B8EBFF, #E2C6FF, #C9B8FF)', color: '#121217' }}>RS</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 600 }}>Riya Sharma</div><div className="muted" style={{ fontSize: 13 }}>Spark Fest ambassador</div></div>
          <button className="iconbtn" onClick={onLogout} aria-label="Sign out"><Icon n="logout" size={18} /></button>
        </div>
        {tab === 'home' && <Home refs={refs} paid={paid} revenue={revenue} conv={conv} link={link} copy={copy} share={share} go={go} />}
        {tab === 'list' && <Referrals refs={refs} />}
      </div>
      <nav className="tabbar" aria-label="Ambassador" style={{ width: 'min(230px, calc(100% - 40px))' }}>
        <button className={tab === 'home' ? 'on' : ''} aria-current={tab === 'home' ? 'page' : undefined} onClick={() => go('home')}><Icon n="grid" />Overview</button>
        <button className={tab === 'list' ? 'on' : ''} aria-current={tab === 'list' ? 'page' : undefined} onClick={() => go('list')}><Icon n="users" />Referrals</button>
      </nav>
      <Toaster />
    </div>
  );
}

function Home({ refs, paid, revenue, conv, link, copy, share, go }) {
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (13 - i));
    const end = d.getTime() + 86400000;
    const inDay = refs.filter((x) => x.createdAt >= d.getTime() && x.createdAt < end);
    return { label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), total: inDay.length, paid: inDay.filter((x) => x.paid).length };
  });
  const max = Math.max(4, ...days.map((d) => d.total));
  const colleges = Object.entries(refs.reduce((m, x) => ({ ...m, [x.college]: (m[x.college] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).slice(0, 4);
  return (
    <>
      <h1 className="title" style={{ fontSize: 36 }}>{refs.length} students found Spark Fest through you</h1>
      <p className="muted" style={{ fontSize: 15, marginTop: 10, lineHeight: 1.5 }}>{paid.length} have paid for a pass. New sign-ups with your code appear here as they happen.</p>

      <section className="foil" style={{ marginTop: 22, borderRadius: 30, padding: 22, boxShadow: '0 28px 44px -30px rgba(43,43,234,.5)' }}>
        <div className="between"><span style={{ fontSize: 14, color: '#3F3F4A' }}>Your referral code</span><span className="pill" style={{ background: 'rgba(255,255,255,.7)' }}>10% off for friends</span></div>
        <div className="serif" style={{ fontSize: 56, lineHeight: 1, marginTop: 16, letterSpacing: '0.02em' }}>{CODE}</div>
        <div className="ellipsis" style={{ background: 'rgba(255,255,255,.75)', borderRadius: 14, padding: '12px 14px', fontSize: 14, marginTop: 20 }}>{link}</div>
        <div className="row" style={{ gap: 8, marginTop: 10 }}>
          <button className="btn dark" style={{ flex: 1, borderRadius: 18 }} onClick={share}><Icon n="share" size={18} />Share link</button>
          <button className="btn" style={{ background: '#fff', width: 52, padding: 0, borderRadius: 18 }} onClick={copy} aria-label="Copy link"><Icon n="copy" size={18} /></button>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
        {[['Sign-ups', refs.length], ['Paid passes', paid.length], ['Conversion', conv + '%'], ['Revenue', money(revenue)]].map(([k, v]) => (
          <div key={k} className="stat"><div className="muted" style={{ fontSize: 13 }}>{k}</div><div className="v">{v}</div></div>
        ))}
      </div>

      <div className="section"><h2 className="h2">Last 14 days</h2>
        <span className="row" style={{ gap: 10, fontSize: 12 }}>
          <span className="row" style={{ gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: '#2B2BEA' }} />Paid</span>
          <span className="row" style={{ gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: '#D6D6F7' }} />Signed up</span>
        </span>
      </div>
      <div className="card" style={{ padding: '18px 14px 12px' }}>
        <div role="img" aria-label="Daily sign-ups over the last 14 days" style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 150 }}>
          {days.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <span className="num muted" style={{ fontSize: 10 }}>{d.total || ''}</span>
              <div style={{ width: '100%', height: (d.total / max) * 110 + 3, borderRadius: 6, background: '#D6D6F7', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: d.total ? (d.paid / d.total) * 100 + '%' : 0, background: '#2B2BEA', borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="between muted" style={{ fontSize: 11.5, marginTop: 8 }}><span>{days[0].label}</span><span>Today</span></div>
      </div>

      <div className="section"><h2 className="h2">Where they study</h2></div>
      <div className="card" style={{ padding: 18, display: 'grid', gap: 14 }}>
        {colleges.map(([c, n]) => (
          <div key={c}>
            <div className="between" style={{ fontSize: 14 }}><span>{c}</span><span className="num muted">{n}</span></div>
            <div className="bar" style={{ marginTop: 6 }}><span style={{ width: (n / colleges[0][1]) * 100 + '%' }} /></div>
          </div>
        ))}
      </div>

      <div className="section"><h2 className="h2">Latest sign-ups</h2><button className="link" onClick={() => go('list')}>See all</button></div>
      <RefList refs={refs.slice(0, 4)} />
    </>
  );
}

function RefList({ refs }) {
  return (
    <div className="list">
      {refs.map((x) => (
        <div key={x.id} className="lrow">
          <span className="avatar" style={{ width: 38, height: 38, fontSize: 12, background: '#E8E8FF', color: '#2323C9' }}>{initials(x.name)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t ellipsis">{x.name || 'New student'}</div>
            <div className="s ellipsis">{x.college}, {new Date(x.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
          </div>
          {x.paid ? <span className="pill green">{money(x.amount)}</span> : <span className="pill grey">Not paid</span>}
        </div>
      ))}
      {!refs.length && <p className="muted" style={{ padding: '18px 0', textAlign: 'center', fontSize: 14 }}>No sign-ups here yet.</p>}
    </div>
  );
}

function Referrals({ refs }) {
  const [f, setF] = useState('all');
  const [limit, setLimit] = useState(20);
  const list = refs.filter((x) => f === 'all' || (f === 'paid' ? x.paid : !x.paid));
  return (
    <>
      <h1 className="title">Referrals</h1>
      <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>Everyone who signed up with {CODE}.</p>
      <div className="seg" style={{ marginTop: 18 }}>
        {[['all', 'All'], ['paid', 'Paid'], ['unpaid', 'Not paid']].map(([k, l]) => <button key={k} className={f === k ? 'on' : ''} aria-pressed={f === k} onClick={() => { setF(k); setLimit(20); }}>{l}</button>)}
      </div>
      <div style={{ marginTop: 12 }}><RefList refs={list.slice(0, limit)} /></div>
      {list.length > limit && <button className="btn light block sm" style={{ marginTop: 10, height: 44 }} onClick={() => setLimit(limit + 20)}>Show more ({list.length - limit} left)</button>}
      {f === 'unpaid' && list.length > 0 && <p className="muted" style={{ fontSize: 13, marginTop: 12, lineHeight: 1.5 }}>A friendly nudge helps. Their 10% off stays valid until the code expires on 12 Dec.</p>}
    </>
  );
}
