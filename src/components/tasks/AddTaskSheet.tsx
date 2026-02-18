import { useState } from 'react';
import BottomSheet from '@/components/shared/BottomSheet';
import type { Kid } from '@/lib/types';

const EMOJI_GRID = [
  '\u{1F9F9}', '\u{1F9F8}', '\u{1F4DA}', '\u{1F3B9}', '\u{1F37D}\u{FE0F}',
  '\u{1F319}', '\u{1FAA5}', '\u{270F}\u{FE0F}', '\u{1F3C3}', '\u{1F3A8}',
  '\u{1F415}', '\u{1F4A4}', '\u{1F6BF}', '\u{1F5D1}\u{FE0F}', '\u{1F455}',
  '\u{1F6CF}\u{FE0F}', '\u{1F4D6}', '\u{1F3AE}', '\u{2B50}', '\u{1F31F}',
];

interface AddTaskSheetProps {
  open: boolean;
  onClose: () => void;
  kids: Kid[];
  onSave: (task: {
    title: string;
    points: number;
    icon: string;
    category: 'household' | 'personal';
    assignedKidId?: string;
  }) => Promise<void>;
}

export default function AddTaskSheet({ open, onClose, kids, onSave }: AddTaskSheetProps) {
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState('');
  const [icon, setIcon] = useState(EMOJI_GRID[0]);
  const [category, setCategory] = useState<'household' | 'personal'>('household');
  const [assignedKidId, setAssignedKidId] = useState(kids[0]?.id ?? '');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle('');
    setPoints('');
    setIcon(EMOJI_GRID[0]);
    setCategory('household');
    setAssignedKidId(kids[0]?.id ?? '');
  };

  const handleSave = async () => {
    const pts = parseInt(points, 10);
    if (!title.trim() || !pts || pts <= 0) return;

    setSaving(true);
    await onSave({
      title: title.trim(),
      points: pts,
      icon,
      category,
      assignedKidId: category === 'personal' ? assignedKidId : undefined,
    });
    setSaving(false);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isValid = title.trim().length > 0 && parseInt(points, 10) > 0;

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <h2 className="text-lg font-bold text-text">New Task</h2>

      {/* Title */}
      <input
        type="text"
        placeholder="Task name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mt-4 w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm font-semibold text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />

      {/* Points */}
      <input
        type="number"
        inputMode="numeric"
        placeholder="Points"
        min="1"
        max="999"
        value={points}
        onChange={(e) => setPoints(e.target.value)}
        className="mt-3 w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm font-semibold text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />

      {/* Icon picker */}
      <p className="mt-4 text-xs font-semibold text-text-muted">Icon</p>
      <div className="mt-2 grid grid-cols-10 gap-1">
        {EMOJI_GRID.map((emoji) => (
          <button
            key={emoji}
            onClick={() => setIcon(emoji)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors ${
              icon === emoji ? 'bg-primary/15 ring-2 ring-primary' : 'bg-bg'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Category toggle */}
      <p className="mt-4 text-xs font-semibold text-text-muted">Category</p>
      <div className="mt-2 flex gap-2">
        {(['household', 'personal'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-1 rounded-xl border py-2 text-sm font-bold transition-colors ${
              category === cat
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-surface text-text'
            }`}
          >
            {cat === 'household' ? 'Household' : 'Personal'}
          </button>
        ))}
      </div>

      {/* Kid selector (if personal) */}
      {category === 'personal' && (
        <div className="mt-3 flex gap-2">
          {kids.map((kid) => (
            <button
              key={kid.id}
              onClick={() => setAssignedKidId(kid.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                assignedKidId === kid.id
                  ? 'text-white'
                  : 'border border-border bg-surface text-text'
              }`}
              style={assignedKidId === kid.id ? { backgroundColor: kid.color } : undefined}
            >
              <span>{kid.avatar}</span>
              {kid.name}
            </button>
          ))}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!isValid || saving}
        className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-opacity disabled:opacity-40"
      >
        {saving ? 'Saving...' : 'Save Task'}
      </button>
    </BottomSheet>
  );
}
