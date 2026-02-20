import { motion } from 'framer-motion';
import type { Task } from '@/lib/types';
import { hapticMedium } from '@/lib/haptics';

interface TaskCardProps {
  task: Task;
  subtitle: string;
  onTap: () => void;
}

export default function TaskCard({ task, subtitle, onTap }: TaskCardProps) {
  return (
    <motion.button
      onClick={() => {
        hapticMedium();
        onTap();
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className="flex w-full items-center gap-0 overflow-hidden rounded-2xl bg-surface text-left"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      {/* Left accent bar */}
      <div
        className="w-1 self-stretch rounded-r-full"
        style={{ backgroundColor: task.category === 'personal' ? '#A78BFA' : '#7C5CFC' }}
      />

      <div className="flex flex-1 items-center gap-3 py-3 pl-3 pr-4">
        {/* Icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: '#F3F0FF' }}
        >
          {task.icon}
        </div>

        {/* Title + subtitle */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-bold text-text">{task.title}</p>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>

        {/* Points pill */}
        <div className="shrink-0 rounded-full bg-gold/30 px-3 py-1">
          <span className="text-sm font-extrabold text-amber-800">+{task.points}</span>
        </div>
      </div>
    </motion.button>
  );
}
