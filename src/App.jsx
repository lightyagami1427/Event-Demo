import { useEffect, useState } from 'react';
import Login from './Login.jsx';
import Student from './Student.jsx';
import Volunteer from './Volunteer.jsx';
import Admin from './Admin.jsx';
import Ambassador from './Ambassador.jsx';

const SKEY = 'sparkfest-session';

export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) { return null; }
  });
  const login = (s) => { localStorage.setItem(SKEY, JSON.stringify(s)); setSession(s); window.scrollTo(0, 0); };
  const logout = () => { localStorage.removeItem(SKEY); setSession(null); window.scrollTo(0, 0); };

  const role = session ? session.role : null;
  const mobile = true;
  useEffect(() => { document.body.classList.toggle('m', mobile); }, [mobile]);

  if (!session) return <Login onLogin={login} />;
  if (role === 'volunteer') return <Volunteer session={session} onLogout={logout} />;
  if (role === 'admin') return <Admin onLogout={logout} />;
  if (role === 'ambassador') return <Ambassador onLogout={logout} />;
  return <Student session={session} onLogout={logout} />;
}
