import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';

const COIN_VALUES = [5, 10, 20];

interface QuickAddCoinsProps {
  onAdd: (points: number) => void;
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

  const spawnFloat = useCallback((value: number, index: number) => {
    const id = Date.now() + Math.random();
    const x = index * 76;
    setFloatingTexts((prev) => [...prev, { id, value, x }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((f) => f.id !== id));
    }, 600);
  }, []);

  const handleTap = (value: number, index: number) => {
    onAdd(value);
    spawnFloat(value, index);
  };

  const handleDragEnd = (value: number, index: number, _: unknown, info: PanInfo) => {
    onDragStateChange?.(false);
    // If dragged upward past threshold, treat as drop into jar
    if (info.offset.y < -80) {
      onAdd(value);
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

      {/* Coin chips — tappable & draggable */}
      <div className="flex items-center gap-5">
        {COIN_VALUES.map((value, index) => (
          <motion.button
            key={value}
            whileTap={{ scale: 1.15 }}
            drag
            dragSnapToOrigin
            dragElastic={0.6}
            onDragStart={() => onDragStateChange?.(true)}
            onDragEnd={(e, info) => handleDragEnd(value, index, e, info)}
            onClick={() => handleTap(value, index)}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
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
