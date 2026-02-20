import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomSheet from '@/components/shared/BottomSheet';
import { useToast } from '@/components/shared/Toast';
import { hapticSuccess, hapticMedium } from '@/lib/haptics';
import { playSuccess, playError } from '@/lib/sounds';
import type { Reward } from '@/lib/types';

interface RedeemSheetProps {
  open: boolean;
  onClose: () => void;
  reward: Reward | null;
  kidName: string;
  balance: number;
  onConfirm: () => Promise<void>;
}

const CELEBRATION_EMOJIS = ['\u{1F389}', '\u{2B50}', '\u{1F31F}', '\u{1F38A}', '\u{2728}', '\u{1F388}'];

export default function RedeemSheet({ open, onClose, reward, kidName, balance, onConfirm }: RedeemSheetProps) {
  const [state, setState] = useState<'idle' | 'celebrating'>('idle');
  const { showToast } = useToast();

  if (!reward) return null;

  const canAfford = balance >= reward.pointsCost;
  const balanceAfter = balance - reward.pointsCost;

  const handleRedeem = async () => {
    if (!canAfford) {
      hapticMedium();
      playError();
      return;
    }
    await onConfirm();
    hapticSuccess();
    playSuccess();
    setState('celebrating');
    showToast('\u{1F381}', `${kidName} earned ${reward.title}!`);
    setTimeout(() => {
      setState('idle');
      onClose();
    }, 1200);
  };

  const handleClose = () => {
    setState('idle');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <AnimatePresence mode="wait">
        {state === 'celebrating' ? (
          <motion.div
            key="celebrate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-col items-center py-8"
          >
            {/* Floating emoji particles */}
            {CELEBRATION_EMOJIS.map((emoji, i) => (
              <motion.span
                key={i}
                initial={{
                  opacity: 1,
                  y: 0,
                  x: (i - 2.5) * 24,
                  scale: 0.5,
                }}
                animate={{
                  opacity: 0,
                  y: -60 - Math.random() * 40,
                  scale: 1,
                  rotate: (i % 2 === 0 ? 1 : -1) * 20,
                }}
                transition={{ duration: 1, ease: 'easeOut', delay: i * 0.06 }}
                className="pointer-events-none absolute text-2xl"
              >
                {emoji}
              </motion.span>
            ))}

            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.4, times: [0, 0.6, 1] }}
              className="text-5xl"
            >
              {'\u{1F389}'}
            </motion.span>
            <p className="mt-3 text-lg font-bold text-text">Redeemed!</p>
            <p className="text-sm text-text-muted">{kidName} earned {reward.title}</p>
          </motion.div>
        ) : (
          <motion.div key="confirm" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Reward icon + title */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                style={{ backgroundColor: '#F3F0FF' }}
              >
                {reward.icon}
              </div>
              <div>
                <p className="text-lg font-bold text-text">{reward.title}</p>
                <p className="text-sm font-extrabold text-amber-600">
                  {reward.pointsCost} {'\u2B50'}
                </p>
              </div>
            </div>

            {/* Balance breakdown */}
            <div className="mt-5 rounded-xl bg-bg px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Current balance</span>
                <span className="font-bold text-text">{balance} pts</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-text-muted">Cost</span>
                <span className="font-bold text-danger">-{reward.pointsCost} pts</span>
              </div>
              <div className="mt-2 border-t border-border pt-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-text-muted">After</span>
                <span className={`font-extrabold ${canAfford ? 'text-text' : 'text-danger'}`}>
                  {balanceAfter} pts
                </span>
              </div>
            </div>

            {/* Confirmation text */}
            <p className="mt-4 text-center text-sm text-text-muted">
              Redeem for <span className="font-bold text-text">{kidName}</span>?
            </p>

            {/* Buttons */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 rounded-xl border border-border bg-surface py-3 text-sm font-bold text-text-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleRedeem}
                disabled={!canAfford}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white transition-opacity disabled:opacity-40 active:brightness-95"
              >
                Redeem {'\u{1F389}'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  );
}
