import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CustomAmountModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (points: number) => void;
  kidName: string;
}

export default function CustomAmountModal({ open, onClose, onConfirm, kidName }: CustomAmountModalProps) {
  const [value, setValue] = useState('');

  const handleConfirm = () => {
    const num = parseInt(value, 10);
    if (num > 0) {
      onConfirm(num);
      setValue('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-4 top-1/3 z-50 mx-auto max-w-sm rounded-2xl bg-surface p-6"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-text-muted"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-text">Add Points</h2>
            <p className="mt-1 text-sm text-text-muted">
              Award custom points to {kidName}
            </p>

            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="999"
              placeholder="Enter points"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              autoFocus
              className="mt-4 w-full rounded-xl border border-border bg-bg px-4 py-3 text-center text-2xl font-extrabold text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <button
              onClick={handleConfirm}
              disabled={!value || parseInt(value, 10) <= 0}
              className="mt-4 w-full rounded-xl bg-primary py-3 text-base font-bold text-white transition-opacity disabled:opacity-40"
            >
              Add {value ? `+${value}` : ''} Points
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
