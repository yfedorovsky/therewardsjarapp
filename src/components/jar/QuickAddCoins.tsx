import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { hapticMedium } from '@/lib/haptics';
import { playCoinTap } from '@/lib/sounds';

const DENOMINATIONS = [
  { value: 5, color: '#FFD966', border: '#D4B44A', label: '+5' },
  { value: 10, color: '#FF8C42', border: '#D46E2A', label: '+10' },
  { value: 20, color: '#4ECDC4', border: '#38A89D', label: '+20' },
];

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

/** Small stacked coin pile for a denomination button */
function CoinStack({ color, border, label }: { color: string; border: string; label: string }) {
  const stackCoins = [
    { dy: 6, dx: 2, opacity: 0.5 },
    { dy: 3, dx: 1, opacity: 0.7 },
    { dy: 0, dx: 0, opacity: 1 },
  ];

  return (
    <div className="relative" style={{ width: 56, height: 62 }}>
      {stackCoins.map((sc, i) => (
        <div
          key={i}
          className="absolute left-0 top-0 flex items-center justify-center rounded-full"
          style={{
            width: 56,
            height: 56,
            transform: `translate(${sc.dx}px, ${sc.dy}px)`,
            background: color,
            border: `2px solid ${border}`,
            opacity: sc.opacity,
            zIndex: i,
          }}
        >
          {i === stackCoins.length - 1 && (
            <>
              {/* Star emblem behind label */}
              <svg
                viewBox="0 0 20 20"
                width="32"
                height="32"
                className="absolute"
                style={{ opacity: 0.2 }}
              >
                <path
                  d="M10 1 L12.5 7.2 L19 7.8 L14 12.2 L15.5 18.6 L10 15.2 L4.5 18.6 L6 12.2 L1 7.8 L7.5 7.2 Z"
                  fill="white"
                />
              </svg>
              <span className="relative z-10 text-sm font-extrabold text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                {label}
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default function QuickAddCoins({ onAdd, onCustom, onDragStateChange }: QuickAddCoinsProps) {
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const spawnFloat = useCallback((value: number, index: number) => {
    const id = Date.now() + Math.random();
    const x = index * 80;
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
    if (info.offset.y < -80) {
      hapticMedium();
      playCoinTap();
      onAdd(value, getOrigin(index, value));
      spawnFloat(value, index);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Floating +N texts */}
      <div className="relative h-6 w-[240px]">
        <AnimatePresence>
          {floatingTexts.map((ft) => (
            <motion.span
              key={ft.id}
              initial={{ opacity: 1, y: 0, x: ft.x + 20 }}
              animate={{ opacity: 0, y: -25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="pointer-events-none absolute text-base font-extrabold text-gold"
            >
              +{ft.value}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Frosted shelf with coin stacks */}
      <div
        className="flex items-end justify-center gap-5 rounded-2xl px-6 py-3"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        {DENOMINATIONS.map((denom, index) => (
          <motion.button
            key={denom.value}
            ref={(el) => { buttonRefs.current[index] = el; }}
            whileTap={{ scaleY: 0.9, scaleX: 1.02 }}
            drag
            dragSnapToOrigin
            dragElastic={0.6}
            onDragStart={() => onDragStateChange?.(true)}
            onDragEnd={(e, info) => handleDragEnd(denom.value, index, e, info)}
            onClick={() => handleTap(denom.value, index)}
            className="coin-stack-bob select-none touch-none"
            style={{
              '--bob-dur': `${2.8 + index * 0.5}s`,
              '--bob-delay': `${index * 0.6}s`,
            } as React.CSSProperties}
          >
            <CoinStack color={denom.color} border={denom.border} label={denom.label} />
          </motion.button>
        ))}
      </div>

      {/* Custom amount link */}
      <button
        onClick={onCustom}
        className="text-xs font-semibold text-white/50 underline underline-offset-2 decoration-white/30"
      >
        Add custom amount
      </button>
    </div>
  );
}
