import { useEffect, useRef, useState } from 'react';
import { illustration } from './illustration.js';
import { ROLES } from './store.js';
import { Icon, Logo, Spinner } from './ui.jsx';

const DEMO = [
  { label: 'Student', email: 'student@mail.com' },
  { label: 'Volunteer', email: 'volunteer@mail.com' },
  { label: 'Admin', email: 'admin@mail.com' },
  { label: 'Ambassador', email: 'influencer@mail.com' },
];
const DONE = {
  student: { h: 'You’re on the list', p: 'Your seat at Spark Fest is waiting.', cta: 'Continue' },
  volunteer: { h: 'Ready at the gate', p: 'Signed in as a volunteer. Your scanning stations are set by the admin.', cta: 'Open scanner' },
  admin: { h: 'Welcome back', p: 'Signed in to the Spark Fest control room.', cta: 'Open admin panel' },
  ambassador: { h: 'Welcome back, Riya', p: 'See who your referral code brought to Spark Fest.', cta: 'Open my dashboard' },
};

export default function Login({ onLogin }) {
  const [step, setStep] = useState('auth');
  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [resend, setResend] = useState(30);
  const [focus, setFocus] = useState(false);
  const [via, setVia] = useState(null);
  const t = useRef();
  const otpRef = useRef();

  useEffect(() => {
    if (step !== 'otp') return;
    const i = setInterval(() => setResend((r) => (r > 0 ? r - 1 : 0)), 1000);
    otpRef.current && otpRef.current.focus();
    return () => clearInterval(i);
  }, [step]);
  useEffect(() => () => clearTimeout(t.current), []);
  const later = (ms, fn) => { clearTimeout(t.current); t.current = setTimeout(fn, ms); };

  const pd = phone.length > 5 ? phone.slice(0, 5) + ' ' + phone.slice(5) : phone;
  const canSend = method === 'phone' ? phone.length === 10 : email.indexOf('@') > 0;
  const role = via === 'google' || method === 'phone' ? 'student' : ROLES[email.trim().toLowerCase()] || 'student';
  const who = method === 'phone' ? '+91 ' + pd : email.trim();

  const send = () => {
    if (method === 'phone' && !/^[6-9]\d{9}$/.test(phone)) return setError('Enter a 10-digit Indian mobile number that starts with 6, 7, 8 or 9.');
    if (method === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError('Enter a full email address, like name@college.edu.');
    setError(''); setLoading('send');
    later(800, () => { setLoading(''); setOtp(''); setResend(30); setStep('otp'); });
  };
  const verify = (code) => {
    setLoading('verify'); setError('');
    later(900, () => {
      setLoading('');
      if (code === '000000') { setOtp(''); setError('That code doesn’t match. Check the latest message and try again.'); }
      else { setVia(method); setStep('done'); }
    });
  };
  const google = () => { setLoading('google'); later(1100, () => { setLoading(''); setVia('google'); setStep('done'); }); };
  const finish = () => onLogin({ role, email: via === 'google' ? 'aanya.rao@gmail.com' : who, at: Date.now() });

  const lit = step === 'done'
    ? { night: 0.92, beams: 1, bulbs: 1, screen: 1, phones: 1, confetti: 1 }
    : step === 'otp'
      ? { night: 0.45, beams: loading === 'verify' ? 0.8 : 0.4, bulbs: 1, screen: 0.6, phones: 0.35, confetti: 0 }
      : { night: 0, beams: 0, bulbs: canSend ? 0.8 : 0.35, screen: 0.15, phones: 0, confetti: 0 };
  const copy = DONE[role];
  const busy = !!loading;

  return (
    <div className="mobile white" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 1, padding: '20px 24px 0' }}>
        <div style={{ position: 'relative', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {step === 'otp' && (
            <button className="iconbtn" style={{ position: 'absolute', left: -4, border: '1px solid #E7E7EB' }} onClick={() => { clearTimeout(t.current); setLoading(''); setError(''); setStep('auth'); }} aria-label="Back to sign in"><Icon n="back" /></button>
          )}
          <Logo />
        </div>

        {step === 'auth' && (
          <div className="in">
            <h1 className="serif" style={{ marginTop: 30, textAlign: 'center', fontSize: 34, lineHeight: 1.1 }}>Your seat at Spark Fest</h1>
            <p className="muted" style={{ marginTop: 8, textAlign: 'center', fontSize: 15 }}>Two days of workshops, talks and live sets.</p>

            <button className="btn light block" style={{ marginTop: 26, height: 50, fontWeight: 500 }} onClick={google} disabled={busy && loading !== 'google'}>
              {loading === 'google' ? <Spinner /> : (
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" /></svg>
              )}
              {loading === 'google' ? 'Connecting to Google' : 'Continue with Google'}
            </button>

            <div className="row muted" style={{ margin: '16px 0', fontSize: 13 }}>
              <div style={{ flex: 1, height: 1, background: '#EDEDF0' }} /><span>or with a one-time code</span><div style={{ flex: 1, height: 1, background: '#EDEDF0' }} />
            </div>

            <div className="seg" role="group" aria-label="Sign in method">
              <button className={method === 'email' ? 'on' : ''} aria-pressed={method === 'email'} onClick={() => { setMethod('email'); setError(''); }}>Email</button>
              <button className={method === 'phone' ? 'on' : ''} aria-pressed={method === 'phone'} onClick={() => { setMethod('phone'); setError(''); }}>Phone</button>
            </div>

            {method === 'email' ? (
              <div className={'field' + (error ? ' err' : '')} style={{ marginTop: 10 }}>
                <label htmlFor="em" className="sr">Email address</label>
                <input id="em" type="email" inputMode="email" autoComplete="email" placeholder="you@college.edu" value={email} onChange={(e) => { setEmail(e.target.value.slice(0, 80)); setError(''); }} onKeyDown={(e) => e.key === 'Enter' && canSend && send()} />
              </div>
            ) : (
              <div className={'field' + (error ? ' err' : '')} style={{ marginTop: 10 }}>
                <span className="pre">+91</span>
                <label htmlFor="ph" className="sr">Mobile number</label>
                <input id="ph" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Mobile number" value={pd} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }} onKeyDown={(e) => e.key === 'Enter' && canSend && send()} />
              </div>
            )}
            {error && <p className="error" role="alert">{error}</p>}

            <button className="btn dark block" style={{ marginTop: 12 }} disabled={!canSend || busy} onClick={send}>
              {loading === 'send' && <Spinner />}{loading === 'send' ? 'Sending code' : 'Send code'}
            </button>

            <div style={{ marginTop: 18 }}>
              <div className="muted" style={{ fontSize: 12.5, textAlign: 'center', marginBottom: 8 }}>Demo logins</div>
              <div className="chips" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                {DEMO.map((d) => (
                  <button key={d.email} className={'chip outline' + (email === d.email && method === 'email' ? ' on' : '')} style={{ height: 32, fontSize: 13, padding: '0 12px' }} onClick={() => { setMethod('email'); setEmail(d.email); setError(''); }}>{d.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="in">
            <h1 className="serif" style={{ marginTop: 30, textAlign: 'center', fontSize: 34, lineHeight: 1.1 }}>Check your messages</h1>
            <p className="muted" style={{ marginTop: 8, textAlign: 'center', fontSize: 15, lineHeight: 1.5 }}>
              We sent a 6-digit code to <span style={{ color: '#121217', fontWeight: 500 }}>{who}</span>.{' '}
              <button className="link" style={{ fontSize: 15, padding: 0 }} onClick={() => setStep('auth')}>Change</button>
            </p>
            <label htmlFor="otp" className="sr">One-time code</label>
            <div style={{ position: 'relative', marginTop: 26, display: 'flex', gap: 8 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const active = focus && i === otp.length && !busy;
                const border = error ? '#C0262D' : active ? '#2B2BEA' : i < otp.length ? '#121217' : '#E4E4E9';
                return (
                  <div key={i} style={{ flex: 1, height: 58, borderRadius: 12, background: '#fff', border: '1.5px solid ' + border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 600, transition: 'border-color .15s, box-shadow .15s', boxShadow: active ? '0 0 0 4px rgba(43,43,234,.12)' : 'none' }}>
                    {otp[i] || ''}
                    {active && <span className="caret" style={{ width: 2, height: 24, borderRadius: 2, background: '#2B2BEA' }} />}
                  </div>
                );
              })}
              <input ref={otpRef} id="otp" type="text" inputMode="numeric" autoComplete="one-time-code" value={otp} disabled={busy}
                onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
                onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setOtp(v); setError(''); if (v.length === 6) verify(v); }}
                style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', border: 0, fontSize: 16 }} />
            </div>
            {error && <p className="error" role="alert" style={{ textAlign: 'center' }}>{error}</p>}
            <button className="btn dark block" style={{ marginTop: 18 }} disabled={otp.length < 6 || busy} onClick={() => verify(otp)}>
              {loading === 'verify' && <Spinner />}{loading === 'verify' ? 'Checking code' : 'Verify and continue'}
            </button>
            <div className="row muted" style={{ justifyContent: 'center', gap: 6, fontSize: 14, marginTop: 12, minHeight: 32 }}>
              <span>Didn’t get it?</span>
              {resend > 0 ? <span className="num">Resend in 0:{String(resend).padStart(2, '0')}</span>
                : <button className="link" style={{ fontSize: 14, fontWeight: 600 }} onClick={() => { setResend(30); setOtp(''); setError(''); }}>Resend code</button>}
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="in" style={{ textAlign: 'center' }}>
            <h1 className="serif" style={{ marginTop: 30, fontSize: 38, lineHeight: 1.08 }}>{copy.h}</h1>
            <p className="muted" style={{ margin: '10px auto 0', maxWidth: 300, fontSize: 15, lineHeight: 1.5 }}>{copy.p}</p>
            <div className="row" style={{ display: 'inline-flex', marginTop: 22, padding: '10px 14px 10px 10px', borderRadius: 999, background: '#F2F2F4', fontSize: 14, gap: 10 }}>
              <span style={{ width: 26, height: 26, borderRadius: 999, background: '#12805C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon n="check" size={14} color="#fff" sw={3} /></span>
              <span>{via === 'google' ? 'aanya.rao@gmail.com' : who} verified</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 24 }} />
      <div style={{ position: 'relative', height: 350, marginTop: -40 }}>
        <div style={{ position: 'absolute', inset: 0 }} dangerouslySetInnerHTML={{ __html: illustration(lit) }} />
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 'max(26px, env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {step === 'done' && (
            <>
              <button className="btn block" onClick={finish} style={{ background: '#fff', color: '#121217', height: 54, boxShadow: '0 10px 30px rgba(10,6,40,.35)' }}>{copy.cta}</button>
              <button className="btn ghost sm" style={{ color: '#D9D3FF' }} onClick={() => { setStep('auth'); setOtp(''); setVia(null); }}>Use a different account</button>
            </>
          )}
          {step === 'otp' && <p style={{ padding: '8px 14px', borderRadius: 999, background: 'rgba(18,13,60,.55)', fontSize: 12.5, color: '#ECE9FF' }}>Demo: any 6 digits sign you in. 000000 shows an error.</p>}
          {step === 'auth' && <p style={{ fontSize: 12, textAlign: 'center', color: '#D9D3FF' }}>By continuing you agree to the event terms and code of conduct.</p>}
        </div>
      </div>
    </div>
  );
}
