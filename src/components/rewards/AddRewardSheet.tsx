import { useState } from 'react';
import BottomSheet from '@/components/shared/BottomSheet';

const EMOJI_GRID = [
  '\u{1F4F1}', '\u{1F370}', '\u{1F381}', '\u{1F3A1}', '\u{1F4D6}',
  '\u{1F3AE}', '\u{1F366}', '\u{1F3AC}', '\u{1F6F9}', '\u{1F9F8}',
  '\u{1F3A8}', '\u{1F3CA}', '\u{1F3AA}', '\u{1F355}', '\u{1F389}',
];

interface AddRewardSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (reward: { title: string; pointsCost: number; icon: string }) => Promise<void>;
}

export default function AddRewardSheet({ open, onClose, onSave }: AddRewardSheetProps) {
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState('');
  const [icon, setIcon] = useState(EMOJI_GRID[0]);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle('');
    setCost('');
    setIcon(EMOJI_GRID[0]);
  };

  const handleSave = async () => {
    const pts = parseInt(cost, 10);
    if (!title.trim() || !pts || pts <= 0) return;

    setSaving(true);
    await onSave({ title: title.trim(), pointsCost: pts, icon });
    setSaving(false);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isValid = title.trim().length > 0 && parseInt(cost, 10) > 0;

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <h2 className="text-lg font-bold text-text">New Reward</h2>

      {/* Title */}
      <input
        type="text"
        placeholder="Reward name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mt-4 w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm font-semibold text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />

      {/* Cost */}
      <input
        type="number"
        inputMode="numeric"
        placeholder="Point cost"
        min="1"
        max="9999"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        className="mt-3 w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm font-semibold text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />

      {/* Icon picker */}
      <p className="mt-4 text-xs font-semibold text-text-muted">Icon</p>
      <div className="mt-2 grid grid-cols-8 gap-1.5">
        {EMOJI_GRID.map((emoji) => (
          <button
            key={emoji}
            onClick={() => setIcon(emoji)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-colors ${
              icon === emoji ? 'bg-primary/15 ring-2 ring-primary' : 'bg-bg'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!isValid || saving}
        className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-opacity disabled:opacity-40"
      >
        {saving ? 'Saving...' : 'Save Reward'}
      </button>
    </BottomSheet>
  );
}
