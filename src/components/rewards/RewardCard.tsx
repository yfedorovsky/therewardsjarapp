import type { Reward } from '@/lib/types';

interface RewardCardProps {
  reward: Reward;
  canAfford: boolean;
  onTap: () => void;
}

export default function RewardCard({ reward, canAfford, onTap }: RewardCardProps) {
  return (
    <button
      onClick={onTap}
      className={`flex flex-col items-center gap-2 rounded-2xl bg-surface px-3 py-4 transition-all duration-100 active:scale-[0.97] ${
        canAfford ? 'opacity-100' : 'opacity-50'
      }`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Icon */}
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
        style={{ backgroundColor: canAfford ? '#F3F0FF' : '#F3F2EF' }}
      >
        {reward.icon}
      </div>

      {/* Title */}
      <p className="text-center text-sm font-bold leading-tight text-text">
        {reward.title}
      </p>

      {/* Cost */}
      <span
        className={`text-sm font-extrabold ${
          canAfford ? 'text-amber-600' : 'text-text-light'
        }`}
      >
        {reward.pointsCost} {'\u2B50'}
      </span>
    </button>
  );
}
