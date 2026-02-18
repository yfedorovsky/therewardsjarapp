import { useState } from 'react';
import BottomSheet from '@/components/shared/BottomSheet';

interface ResetConfirmSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function ResetConfirmSheet({ open, onClose, onConfirm }: ResetConfirmSheetProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [typed, setTyped] = useState('');
  const [resetting, setResetting] = useState(false);

  const handleClose = () => {
    setStep(1);
    setTyped('');
    onClose();
  };

  const handleConfirm = async () => {
    setResetting(true);
    await onConfirm();
    setResetting(false);
    handleClose();
  };

  return (
    <BottomSheet open={open} onClose={handleClose}>
      {step === 1 ? (
        <>
          <h2 className="text-lg font-bold text-danger">Reset All Data?</h2>
          <p className="mt-2 text-sm text-text-muted">
            This will delete all kids, tasks, rewards, and activity history. The app will be re-seeded with default data.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 rounded-xl border border-border bg-surface py-3 text-sm font-bold text-text-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 rounded-xl bg-danger py-3 text-sm font-bold text-white"
            >
              Continue
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-lg font-bold text-danger">This cannot be undone</h2>
          <p className="mt-2 text-sm text-text-muted">
            Type <span className="font-bold text-text">RESET</span> to confirm.
          </p>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Type RESET"
            autoFocus
            className="mt-3 w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-center text-sm font-bold text-text outline-none focus:border-danger focus:ring-2 focus:ring-danger/20"
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 rounded-xl border border-border bg-surface py-3 text-sm font-bold text-text-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={typed !== 'RESET' || resetting}
              className="flex-1 rounded-xl bg-danger py-3 text-sm font-bold text-white transition-opacity disabled:opacity-40"
            >
              {resetting ? 'Resetting...' : 'Reset Everything'}
            </button>
          </div>
        </>
      )}
    </BottomSheet>
  );
}
