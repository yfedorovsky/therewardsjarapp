import type { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  subtitle: string;
  onTap: () => void;
}

export default function TaskCard({ task, subtitle, onTap }: TaskCardProps) {
  return (
    <button
      onClick={onTap}
      className="flex w-full items-center gap-3 rounded-xl bg-surface px-4 py-3 text-left transition-transform duration-100 active:scale-[0.98]"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
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
    </button>
  );
}
