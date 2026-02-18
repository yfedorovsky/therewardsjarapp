import { useState, useEffect } from 'react';
import BottomSheet from '@/components/shared/BottomSheet';
import { KID_COLORS } from '@/lib/constants';
import type { Kid } from '@/lib/types';

const AVATAR_OPTIONS = [
  '\u{1F466}', '\u{1F467}', '\u{1F476}', '\u{1F9D1}',
  '\u{1F468}', '\u{1F469}', '\u{1F431}', '\u{1F436}',
  '\u{1F98A}', '\u{1F981}', '\u{1F984}', '\u{1F43B}',
];

interface EditKidSheetProps {
  open: boolean;
  onClose: () => void;
  kid: Kid | null;
  onSave: (id: string, changes: Partial<Kid>) => Promise<void>;
}

export default function EditKidSheet({ open, onClose, kid, onSave }: EditKidSheetProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [color, setColor] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (kid) {
      setName(kid.name);
      setAvatar(kid.avatar);
      setColor(kid.color);
    }
  }, [kid]);

  const handleSave = async () => {
    if (!kid || !name.trim()) return;
    setSaving(true);
    await onSave(kid.id, { name: name.trim(), avatar, color });
    setSaving(false);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="text-lg font-bold text-text">Edit Kid</h2>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-4 w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm font-semibold text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />

      <p className="mt-4 text-xs font-semibold text-text-muted">Avatar</p>
      <div className="mt-2 grid grid-cols-6 gap-2">
        {AVATAR_OPTIONS.map((a) => (
          <button
            key={a}
            onClick={() => setAvatar(a)}
            className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-colors ${
              avatar === a ? 'bg-primary/15 ring-2 ring-primary' : 'bg-bg'
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs font-semibold text-text-muted">Color</p>
      <div className="mt-2 flex gap-2">
        {KID_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className="h-9 w-9 rounded-full transition-transform"
            style={{
              backgroundColor: c,
              boxShadow: color === c ? `0 0 0 3px var(--color-bg), 0 0 0 5px ${c}` : 'none',
            }}
          />
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={!name.trim() || saving}
        className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-opacity disabled:opacity-40"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </BottomSheet>
  );
}
