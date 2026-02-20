import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { hapticMedium } from '@/lib/haptics';
import { playCoinTap } from '@/lib/sounds';

const COIN_VALUES = [5, 10, 20];

export interface CoinOrigin {
  x: number;
  y: number;
  value: number;
}

interface QuickAddCoinsProps {
  onAdd: (points: number, origin?: CoinOrigin) => void;
  onCustom: () => void;
  onDragStateChange?: (dragging: boolean) => void;
}

interface FloatingText {
  id: number;
  value: number;
  x: number;
}

export default function QuickAddCoins({ onAdd, onCustom, onDragStateChange }: QuickAddCoinsProps) {
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const spawnFloat = useCallback((value: number, index: number) => {
    const id = Date.now() + Math.random();
    const x = index * 76;
    setFloatingTexts((prev) => [...prev, { id, value, x }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((f) => f.id !== id));
    }, 600);
  }, []);

  const getOrigin = (index: number, value: number): CoinOrigin | undefined => {
    const btn = buttonRefs.current[index];
    if (!btn) return undefined;
    const rect = btn.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, value };
  };

  const handleTap = (value: number, index: number) => {
    hapticMedium();
    playCoinTap();
    onAdd(value, getOrigin(index, value));
    spawnFloat(value, index);
  };

  const handleDragEnd = (value: number, index: number, _: unknown, info: PanInfo) => {
    onDragStateChange?.(false);
    // If dragged upward past threshold, treat as drop into jar
    if (info.offset.y < -80) {
      hapticMedium();
      playCoinTap();
      onAdd(value, getOrigin(index, value));
      spawnFloat(value, index);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4">
      {/* Floating +N texts */}
      <div className="relative h-8 w-[228px]">
        <AnimatePresence>
          {floatingTexts.map((ft) => (
            <motion.span
              key={ft.id}
              initial={{ opacity: 1, y: 0, x: ft.x + 22 }}
              animate={{ opacity: 0, y: -30 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="pointer-events-none absolute text-lg font-extrabold text-primary"
            >
              +{ft.value}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Coin chips — tappable & draggable with idle float */}
      <div className="flex items-center gap-5">
        {COIN_VALUES.map((value, index) => (
          <motion.button
            key={value}
            ref={(el) => { buttonRefs.current[index] = el; }}
            whileTap={{ scale: 0.9 }}
            animate={{
              y: [0, -2, 0],
            }}
            drag
            dragSnapToOrigin
            dragElastic={0.6}
            onDragStart={() => onDragStateChange?.(true)}
            onDragEnd={(e, info) => handleDragEnd(value, index, e, info)}
            onClick={() => handleTap(value, index)}
            transition={{
              y: {
                duration: 2.5 + index * 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              scale: { type: 'spring', stiffness: 500, damping: 15 },
            }}
            className="flex items-center justify-center rounded-full font-extrabold text-amber-900 select-none touch-none"
            style={{
              width: 56,
              height: 56,
              background: 'linear-gradient(145deg, #FFE699, #FFD966)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            +{value}
          </motion.button>
        ))}
      </div>

      {/* Custom amount link */}
      <button
        onClick={onCustom}
        className="text-xs font-semibold text-text-muted underline underline-offset-2 decoration-text-light"
      >
        Add custom amount
      </button>
    </div>
  );
}
