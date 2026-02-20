import { motion } from 'framer-motion';
import type { Reward } from '@/lib/types';
import { hapticMedium } from '@/lib/haptics';

interface RewardCardProps {
  reward: Reward;
  canAfford: boolean;
  onTap: () => void;
}

export default function RewardCard({ reward, canAfford, onTap }: RewardCardProps) {
  return (
    <motion.button
      onClick={() => {
        hapticMedium();
        onTap();
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={`flex flex-col items-center gap-2 rounded-2xl bg-surface px-3 py-4 ${
        canAfford ? 'opacity-100' : 'opacity-50'
      }`}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
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
    </motion.button>
  );
}
