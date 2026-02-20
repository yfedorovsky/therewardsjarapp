import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import BottomSheet from '@/components/shared/BottomSheet';
import { useToast } from '@/components/shared/Toast';
import { hapticSuccess } from '@/lib/haptics';
import { playSuccess } from '@/lib/sounds';
import type { Task } from '@/lib/types';

interface CompleteTaskSheetProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  kidName: string;
  onConfirm: () => Promise<void>;
}

export default function CompleteTaskSheet({ open, onClose, task, kidName, onConfirm }: CompleteTaskSheetProps) {
  const [state, setState] = useState<'idle' | 'success'>('idle');
  const { showToast } = useToast();

  const handleConfirm = async () => {
    await onConfirm();
    hapticSuccess();
    playSuccess();
    setState('success');
    showToast('\u{1F389}', `+${task?.points} points for ${kidName}!`);
    setTimeout(() => {
      setState('idle');
      onClose();
    }, 800);
  };

  const handleClose = () => {
    setState('idle');
    onClose();
  };

  if (!task) return null;

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <AnimatePresence mode="wait">
        {state === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-6"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success">
              <Check size={32} strokeWidth={3} className="text-white" />
            </div>
            <p className="mt-3 text-lg font-bold text-text">Done!</p>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Task icon + title */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                style={{ backgroundColor: '#F3F0FF' }}
              >
                {task.icon}
              </div>
              <div>
                <p className="text-lg font-bold text-text">{task.title}</p>
                <p className="text-sm text-text-muted">+{task.points} points</p>
              </div>
            </div>

            {/* Confirmation text */}
            <p className="mt-5 text-center text-sm text-text-muted">
              Award <span className="font-bold text-text">+{task.points}</span> points to{' '}
              <span className="font-bold text-text">{kidName}</span>?
            </p>

            {/* Buttons */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 rounded-xl border border-border bg-surface py-3 text-sm font-bold text-text-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-sm font-bold text-white active:brightness-95"
              >
                Complete
                <Check size={16} strokeWidth={3} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  );
}
