import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMe, updateMe } from '../api/authApi';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  // We will implement a local fetch/update flow
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone((user as any).phone ?? '');
      return;
    }
    getMe().then((res: any) => {
      setName(res.name);
      setEmail(res.email);
      setPhone(res.phone ?? '');
    }).catch(() => {});
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateMe({ name, email, phone });
      setMessage('Profiil uuendatud');
    } catch (err: any) {
      setMessage(err?.response?.data?.error || 'Viga');
    }
  }

  return (
    <div className="main-container">
      <h1>Minu profiil</h1>
      {message && <div className="alert">{message}</div>}
      <form onSubmit={handleSave} style={{ maxWidth: 600 }}>
        <label>Nimi</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} />
        <label>E-post</label>
        <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
        <label>Telefon</label>
        <input className="input" value={phone} onChange={e => setPhone(e.target.value)} />
        <button className="btn btn-primary" style={{ marginTop: 12 }}>Salvesta</button>
      </form>
    </div>
  );
};
