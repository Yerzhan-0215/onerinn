'use client';
import { useState } from 'react';
import ProfileLayout from '@/components/profile/ProfileLayout';

export default function SecurityPage() {
  const [oldPassword, setOld] = useState('');
  const [newPassword, setNew] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await fetch('/api/profile/password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    setLoading(false);
    if (!r.ok) {
      const j = await r.json(); alert(j.error || '修改失败');
    } else {
      alert('已更新密码');
      setOld(''); setNew('');
    }
  }

  return (
    <ProfileLayout>
      <form onSubmit={onSubmit} className="rounded-xl border bg-white p-4 max-w-lg space-y-3">
        <div className="text-lg font-semibold">修改密码</div>
        <input type="password" placeholder="当前密码" value={oldPassword} onChange={e=>setOld(e.target.value)} className="w-full rounded border px-3 py-2"/>
        <input type="password" placeholder="新密码" value={newPassword} onChange={e=>setNew(e.target.value)} className="w-full rounded border px-3 py-2"/>
        <button disabled={loading} className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60">
          {loading ? '提交中...' : '保存'}
        </button>
      </form>
    </ProfileLayout>
  );
}
