import { motion, AnimatePresence } from 'framer-motion';

export interface FlyingCoinData {
  id: number;
  /** Starting position relative to viewport */
  startX: number;
  startY: number;
  /** Target position (jar mouth) relative to viewport */
  endX: number;
  endY: number;
  value: number;
}

interface FlyingCoinProps {
  coins: FlyingCoinData[];
  onComplete: (id: number) => void;
}

export default function FlyingCoin({ coins, onComplete }: FlyingCoinProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <AnimatePresence>
        {coins.map((coin) => {
          const dx = coin.endX - coin.startX;
          // Control point for quadratic bezier — arc upward
          const cpY = Math.min(coin.startY, coin.endY) - 80;

          return (
            <motion.div
              key={coin.id}
              initial={{
                x: coin.startX - 20,
                y: coin.startY - 20,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: [coin.startX - 20, coin.startX + dx * 0.5 - 20, coin.endX - 20],
                y: [coin.startY - 20, cpY - 20, coin.endY - 20],
                scale: [1, 1.1, 0.6],
                opacity: [1, 1, 0.7],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 0.45,
                ease: [0.22, 0.68, 0.35, 1],
              }}
              onAnimationComplete={() => onComplete(coin.id)}
              className="absolute flex items-center justify-center rounded-full font-extrabold text-amber-900"
              style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(145deg, #FFE699, #FFD966)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontSize: 12,
              }}
            >
              +{coin.value}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
