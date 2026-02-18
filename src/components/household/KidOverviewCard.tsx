import { useEffect, useState } from 'react';
import { getKidBalance } from '@/lib/db';
import type { Kid } from '@/lib/types';

interface KidOverviewCardProps {
  kid: Kid;
  isSelected: boolean;
  onTap: () => void;
}

export default function KidOverviewCard({ kid, isSelected, onTap }: KidOverviewCardProps) {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    getKidBalance(kid.id).then(setBalance);
  }, [kid.id]);

  return (
    <button
      onClick={onTap}
      className={`flex w-full flex-col items-center gap-1.5 rounded-2xl bg-surface px-4 py-4 transition-all duration-150 active:scale-[0.97] ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
        style={{ backgroundColor: kid.color + '20' }}
      >
        {kid.avatar}
      </div>
      <span className="text-sm font-bold text-text">{kid.name}</span>
      <span className="text-sm font-extrabold text-amber-600">
        {balance} {'\u2B50'}
      </span>
    </button>
  );
}
