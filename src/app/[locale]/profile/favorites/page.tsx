'use client';
import { useEffect, useState } from 'react';
import ProfileLayout from '@/components/profile/ProfileLayout';

type Fav = { id: string; artwork: { id: string; title: string; status: string } };

export default function FavoritesPage() {
  const [items, setItems] = useState<Fav[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/favorites').then(r=>r.json()).then(d=>{ setItems(d.items||[]); setLoading(false); });
  }, []);

  async function removeFav(artworkId: string) {
    const r = await fetch('/api/favorites', { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ artworkId }) });
    if (r.ok) setItems(items.filter(x => x.artwork.id !== artworkId));
  }

  return (
    <ProfileLayout>
      <div className="rounded-xl border bg-white p-4">
        <div className="mb-3 text-lg font-semibold">收藏</div>
        {loading ? 'Loading...' : (
          <div className="space-y-2">
            {items.map(x => (
              <div key={x.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <div className="font-medium">{x.artwork.title}</div>
                  <div className="text-xs text-black/60">{x.artwork.status}</div>
                </div>
                <button onClick={()=>removeFav(x.artwork.id)} className="rounded-lg border px-3 py-1">
                  取消收藏
                </button>
              </div>
            ))}
            {items.length === 0 && <div className="text-black/60">暂无收藏</div>}
          </div>
        )}
      </div>
    </ProfileLayout>
  );
}
