import { motion, AnimatePresence } from 'framer-motion';

const FLYING_COIN_COLORS: Record<number, { bg: string; border: string }> = {
  5: { bg: '#FFD966', border: '#D4B44A' },
  10: { bg: '#FF8C42', border: '#D46E2A' },
  20: { bg: '#4ECDC4', border: '#38A89D' },
};

export interface FlyingCoinData {
  id: number;
  startX: number;
  startY: number;
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
          const cpY = Math.min(coin.startY, coin.endY) - 80;
          const colors = FLYING_COIN_COLORS[coin.value] || FLYING_COIN_COLORS[5];

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
                scale: [1, 1.1, 0.7],
                opacity: [1, 1, 0.8],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 0.68, 0.35, 1],
              }}
              onAnimationComplete={() => onComplete(coin.id)}
              className="absolute flex items-center justify-center rounded-full font-extrabold text-white"
              style={{
                width: 40,
                height: 40,
                background: colors.bg,
                border: `2px solid ${colors.border}`,
                boxShadow: `0 4px 16px ${colors.bg}60`,
                fontSize: 12,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
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
