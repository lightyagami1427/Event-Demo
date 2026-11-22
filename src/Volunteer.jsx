import { useEffect, useRef, useState } from 'react';
import { useStore, act, STATIONS } from './store.js';
import { Icon, Logo, Toaster, clock, initials, Spinner } from './ui.jsx';

const RESULT = {
  success: { bg: '#12805C', fg: '#fff', title: 'Approved', icon: 'check' },
  already: { bg: '#FCEFD9', fg: '#6B3A08', title: 'Already redeemed', icon: 'close' },
  noentry: { bg: '#FCEFD9', fg: '#6B3A08', title: 'Not checked in yet', icon: 'entry' },
  invalid: { bg: '#C0262D', fg: '#fff', title: 'Invalid pass', icon: 'close' },
  unauthorised: { bg: '#121217', fg: '#fff', title: 'Not your station', icon: 'lock' },
};

export default function Volunteer({ session, onLogout }) {
  const s = useStore();
  const vol = s.volunteers.find((v) => v.email === session.email) || s.volunteers[0];
  const [station, setStation] = useState(vol.perms[0] || 'entry');
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [manual, setManual] = useState('');
  const queue = useRef(0);
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);

  const st = STATIONS.find((x) => x.id === station);
  const allowed = vol.perms.includes(station);
  const mine = s.scans.filter((x) => x.by === vol.name);
  const okHere = mine.filter((x) => x.station === station && x.result === 'success').length;
  const doneAtStation = s.students.filter((x) => x.red[station]).length;

  const run = (passId) => {
    setBusy(true); setRes(null);
    t.current = setTimeout(() => {
      const r = act.scan(passId, station, vol.name);
      setRes({ ...r, passId, station });
      setBusy(false);
      if (navigator.vibrate) navigator.vibrate(r.result === 'success' ? 40 : [60, 60, 60]);
    }, 900);
  };
  // Simulates the next student in the queue: mostly real passes, sometimes a repeat or an unknown code.
  const scanNext = () => {
    const paid = s.students.filter((x) => x.paid && x.id !== 'me');
    queue.current += 1;
    const n = queue.current;
    if (n % 7 === 0) return run('SPK-99-' + (1000 + n));
    if (n % 5 === 0 && mine.length) return run(mine[0].passId);
    const fresh = paid.filter((x) => !x.red[station] && (station === 'entry' || x.red.entry));
    const pick = fresh.length ? fresh[(n * 13) % fresh.length] : paid[n % paid.length];
    run(pick.passId);
  };
  const me = s.students.find((x) => x.id === 'me');

  return (
    <div className="mobile">
      <div className="page in" style={{ paddingBottom: 40 }}>
        <div className="row">
          <div className="avatar">{initials(vol.name)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{vol.name}</div>
            <div className="muted" style={{ fontSize: 13 }}>Volunteer, Spark Fest</div>
          </div>
          <button className="iconbtn" onClick={onLogout} aria-label="Sign out"><Icon n="logout" size={19} /></button>
        </div>

        <h2 className="h2" style={{ marginTop: 24 }}>Station</h2>
        <div className="chips" style={{ marginTop: 10 }} role="group" aria-label="Scanning station">
          {STATIONS.map((x) => {
            const ok = vol.perms.includes(x.id);
            return (
              <button key={x.id} className={'chip' + (station === x.id ? ' on' : '')} aria-pressed={station === x.id} onClick={() => { setStation(x.id); setRes(null); }}>
                {!ok && <Icon n="lock" size={13} sw={2.4} />}{x.short}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', marginTop: 16, borderRadius: 30, overflow: 'hidden', background: '#16121F', aspectRatio: '1 / 0.9' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 60% at 50% 45%, #2A2548 0%, #16121F 70%)' }} />
          <div style={{ position: 'absolute', left: '18%', right: '18%', top: '14%', bottom: '24%' }}>
            {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h]) => (
              <span key={v + h} style={{ position: 'absolute', [v]: 0, [h]: 0, width: 34, height: 34, borderRadius: v === 'top' ? (h === 'left' ? '14px 0 0 0' : '0 14px 0 0') : (h === 'left' ? '0 0 0 14px' : '0 0 14px 0'), border: '3px solid #fff', [v === 'top' ? 'borderBottom' : 'borderTop']: 0, [h === 'left' ? 'borderRight' : 'borderLeft']: 0 }} />
            ))}
            {busy && <div className="scanline" style={{ left: 0, right: 0 }} />}
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 18, textAlign: 'center', color: '#C9C6DA', fontSize: 13.5 }}>
            {busy ? 'Reading code…' : allowed ? 'Point the camera at a student’s pass' : 'You aren’t assigned to ' + st.label}
          </div>
          {res && !busy && (() => {
            const R = RESULT[res.result];
            return (
              <div className="in" role="status" style={{ position: 'absolute', inset: 10, borderRadius: 24, background: R.bg, color: R.fg, padding: 22, display: 'flex', flexDirection: 'column' }}>
                <div className="row" style={{ gap: 10 }}>
                  <span className="pop" style={{ width: 44, height: 44, borderRadius: 999, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n={R.icon} size={22} sw={2.4} /></span>
                  <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>{R.title}</span>
                </div>
                <div style={{ marginTop: 'auto' }}>
                  {res.student && res.result !== 'invalid' && <div className="serif" style={{ fontSize: 30, lineHeight: 1.05 }}>{res.student.name}</div>}
                  <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 6, opacity: 0.9 }}>
                    {res.result === 'success' && res.student.dept + ', ' + res.student.college + '. ' + (station === 'entry' ? 'Let them in.' : st.label + ' redeemed.')}
                    {res.result === 'already' && st.label + ' was already redeemed at ' + clock(res.prev) + '. Don’t hand it over again.'}
                    {res.result === 'noentry' && 'This pass hasn’t checked in at the gate. Send them to Hall 3 first.'}
                    {res.result === 'invalid' && 'Code ' + res.passId + ' isn’t a paid Spark Fest pass. Send them to the help desk.'}
                    {res.result === 'unauthorised' && 'Only volunteers assigned to ' + st.label + ' can scan here. Ask an admin to add it.'}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="row" style={{ gap: 10, marginTop: 12 }}>
          <button className="btn dark" style={{ flex: 1, height: 54, borderRadius: 18 }} onClick={scanNext} disabled={busy}>
            {busy ? <Spinner /> : <Icon n="scan" size={18} />}{res ? 'Scan next' : 'Scan a pass'}
          </button>
        </div>
        <div className="row" style={{ gap: 8, marginTop: 10 }}>
          <div className="field" style={{ flex: 1, height: 46 }}>
            <label htmlFor="pid" className="sr">Pass ID</label>
            <input id="pid" placeholder="Type a pass ID, like SPK-26-1004" value={manual} style={{ fontSize: 14, textTransform: 'uppercase' }} onChange={(e) => setManual(e.target.value.slice(0, 16))} onKeyDown={(e) => e.key === 'Enter' && manual.trim() && run(manual)} />
          </div>
          <button className="btn light sm" style={{ height: 46 }} disabled={!manual.trim() || busy} onClick={() => run(manual)}>Check</button>
        </div>
        {me.paid && <button className="link" style={{ marginTop: 6 }} onClick={() => run(me.passId)} disabled={busy}>Demo: scan {me.name || 'the student account'}’s pass</button>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
          <div className="card" style={{ padding: 16 }}><div className="muted" style={{ fontSize: 12.5 }}>Your scans here</div><div className="num" style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 6 }}>{okHere}</div></div>
          <div className="card" style={{ padding: 16 }}><div className="muted" style={{ fontSize: 12.5 }}>{st.label} total</div><div className="num" style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 6 }}>{doneAtStation}</div></div>
        </div>

        <div className="between" style={{ margin: '24px 2px 10px' }}><h2 className="h2">Your recent scans</h2></div>
        <div className="card" style={{ padding: '4px 16px' }}>
          {mine.slice(0, 8).map((x, i) => {
            const R = RESULT[x.result];
            return (
              <div key={x.id} className="row" style={{ padding: '12px 0', borderTop: i ? '1px solid #F1F1F4' : 0 }}>
                <span style={{ width: 32, height: 32, borderRadius: 999, background: x.result === 'success' ? '#E3F4EC' : x.result === 'already' || x.result === 'noentry' ? '#FCEFD9' : '#FCE9EA', color: x.result === 'success' ? '#12805C' : x.result === 'already' || x.result === 'noentry' ? '#8A4B0B' : '#C0262D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n={R.icon} size={15} sw={2.4} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.name}</div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{R.title}, {STATIONS.find((z) => z.id === x.station).short}</div>
                </div>
                <span className="muted num" style={{ fontSize: 12.5 }}>{clock(x.at)}</span>
              </div>
            );
          })}
          {!mine.length && <p className="muted" style={{ padding: '18px 0', fontSize: 14, textAlign: 'center' }}>Scans you make show up here.</p>}
        </div>
        <div className="row muted" style={{ justifyContent: 'center', marginTop: 24, fontSize: 12.5 }}><Logo size={16} text={false} />Spark Fest volunteer scanner</div>
      </div>
      <Toaster bottom={30} />
    </div>
  );
}
