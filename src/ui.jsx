import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';

const P = {
  entry: 'M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l4-4-4-4M14 12H4',
  bag: 'M6 8h12l-1 12H7L6 8zM9 8a3 3 0 0 1 6 0',
  stall: 'M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9a2.7 2.7 0 0 0 5.3 0a2.7 2.7 0 0 0 5.4 0a2.7 2.7 0 0 0 5.3 0M10 20v-5h4v5',
  spark: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',
  bell: 'M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15L6 16zM10 20a2 2 0 0 0 4 0',
  pass: 'M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V6zM14 6v2M14 11v2M14 16v2',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  chat: 'M4 5h16v11H9l-5 4V5z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  scan: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3',
  wallet: 'M4 7a2 2 0 0 1 2-2h12v4M4 7v11a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2zM16 14.5h.01',
  close: 'M6 6l12 12M18 6L6 18',
  back: 'M15 6l-6 6 6 6',
  up: 'M12 19V5M6 11l6-6 6 6',
  pin: 'M9 4h6l-1 6 4 3v2H6v-2l4-3-1-6zM12 15v6',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  share: 'M12 15V3M7 8l5-5 5 5M5 13v7h14v-7',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3',
  tag: 'M3 12V4h8l10 10-8 8L3 12zM7.5 8h.01',
  gift: 'M4 11h16v10H4zM2 7h20v4H2zM12 7v14M12 7c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
  logout: 'M15 4h4v16h-4M10 16l-4-4 4-4M6 12h10',
  plus: 'M12 5v14M5 12h14',
  download: 'M12 4v12M7 11l5 5 5-5M5 20h14',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
  play: 'M7 5l12 7-12 7V5z',
  chevron: 'M9 6l6 6-6 6',
};

export function Icon({ n, size = 20, color = 'currentColor', sw = 1.8, fill = 'none' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d={P[n]} />
    </svg>
  );
}

export function Logo({ size = 22, text = true, light = false }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill={light ? '#fff' : '#121217'} /><path d="M13 5.5L7.5 13h4l-.7 5.5L16.5 11h-4l.5-5.5z" fill={light ? '#121217' : '#fff'} /></svg>
      {text && <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>Spark Fest</span>}
    </span>
  );
}

// A real, scannable QR. One fixed code per student.
export function QR({ value, size = 200 }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    QRCode.toString('SPARKFEST26:' + value, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#121217', light: '#00000000' } }).then(setSvg);
  }, [value]);
  return <div className="qr" role="img" aria-label={'Entry QR code for pass ' + value} style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function toast(msg) { window.dispatchEvent(new CustomEvent('sf-toast', { detail: msg })); }
export function Toaster({ bottom = 100 }) {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    let t;
    const on = (e) => { setMsg(e.detail); clearTimeout(t); t = setTimeout(() => setMsg(''), 3000); };
    window.addEventListener('sf-toast', on);
    return () => { window.removeEventListener('sf-toast', on); clearTimeout(t); };
  }, []);
  if (!msg) return null;
  return <div className="toast up" role="status" style={{ bottom }}>{msg}</div>;
}

export function Sheet({ children, onClose, label, full }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  // Rendered on <body> so it always sits above the floating tab bar.
  return createPortal(
    <div className="sheet-wrap" role="dialog" aria-label={label} aria-modal="true">
      {!full && <button className="sheet-backdrop" aria-label="Close" onClick={onClose} />}
      <div className={full ? 'sheet-full sheetin' : 'sheet sheetin'}>{children}</div>
    </div>,
    document.body
  );
}

export const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const clock = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
export const initials = (name) => (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
export const ampm = (t) => { const [h, m] = t.split(':').map(Number); return { t: ((h + 11) % 12 + 1) + ':' + String(m).padStart(2, '0'), p: h < 12 ? 'AM' : 'PM' }; };

export function Spinner({ color = 'currentColor' }) {
  return <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-9-9" /></svg>;
}

export function Confetti({ n = 60 }) {
  const cols = ['#FFC98A', '#9FE6FF', '#FFFFFF', '#C9B6FF', '#FF9FB8', '#2B2BEA'];
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} style={{ left: ((i * 37) % 100) + '%', background: cols[i % cols.length], animationDelay: ((i * 53) % 900) / 1000 + 's', animationDuration: 2.2 + ((i * 17) % 10) / 10 + 's', transform: 'rotate(' + (i * 29) % 180 + 'deg)' }} />
      ))}
    </div>
  );
}
