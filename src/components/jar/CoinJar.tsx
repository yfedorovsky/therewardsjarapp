import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticHeavy } from '@/lib/haptics';
import { playCoinDrop } from '@/lib/sounds';

const COIN_COLORS = [
  { fill: '#FFD966', shadow: '#E8C44A' },
  { fill: '#FFCA28', shadow: '#DEB020' },
  { fill: '#FFB74D', shadow: '#E09830' },
  { fill: '#FFC107', shadow: '#D9A200' },
  { fill: '#FFE082', shadow: '#D4BC5E' },
  { fill: '#4FC3F7', shadow: '#349CC8' },
];

const SPARKLE_COLORS = ['#FFD966', '#FFC107', '#FFE082', '#7C5CFC'];

interface CoinJarProps {
  points: number;
  kidName: string;
  glowing?: boolean;
}

function generateCoins(count: number) {
  const coins: { cx: number; cy: number; r: number; colorIndex: number }[] = [];
  const jarLeft = 42;
  const jarRight = 158;
  const jarBottom = 192;
  const coinRadius = 11;

  for (let i = 0; i < count; i++) {
    const seed1 = ((i * 137 + 73) % 100) / 100;
    const seed2 = ((i * 251 + 41) % 100) / 100;
    const row = Math.floor(i / 4);
    const cx = jarLeft + coinRadius + seed1 * (jarRight - jarLeft - coinRadius * 2);
    const cy = jarBottom - coinRadius - row * (coinRadius * 1.6) - seed2 * 4;
    coins.push({ cx, cy, r: coinRadius, colorIndex: i % COIN_COLORS.length });
  }
  return coins;
}

interface Sparkle {
  id: number;
  angle: number;
  color: string;
}

export default function CoinJar({ points, kidName, glowing = false }: CoinJarProps) {
  const targetCount = useMemo(() => Math.min(Math.max(Math.floor(points / 3), 0), 30), [points]);

  // Animate coin count smoothly
  const [displayCount, setDisplayCount] = useState(targetCount);
  const [jiggle, setJiggle] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const rafRef = useRef(0);
  const prevPoints = useRef(points);

  // Detect points increase → trigger sparkle + jiggle + sound
  useEffect(() => {
    if (points > prevPoints.current && prevPoints.current >= 0) {
      // Jiggle the jar
      setJiggle(true);
      setTimeout(() => setJiggle(false), 300);

      // Sparkle burst
      const newSparkles: Sparkle[] = Array.from({ length: 4 }, (_, i) => ({
        id: Date.now() + i,
        angle: (i * 90) + Math.random() * 30 - 15,
        color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
      }));
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 600);

      // Sound + haptic
      hapticHeavy();
      playCoinDrop();
    }
    prevPoints.current = points;
  }, [points]);

  useEffect(() => {
    const from = displayCount;
    const to = targetCount;
    if (from === to) return;

    const steps = Math.abs(to - from);
    const stepDuration = Math.min(80, 400 / steps);
    let step = 0;

    const tick = () => {
      step++;
      const current = from + Math.sign(to - from) * step;
      setDisplayCount(current);
      if (step < steps) {
        rafRef.current = window.setTimeout(tick, stepDuration) as unknown as number;
      }
    };
    rafRef.current = window.setTimeout(tick, stepDuration) as unknown as number;
    return () => clearTimeout(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetCount]);

  const coins = useMemo(() => generateCoins(displayCount), [displayCount]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Sparkle particles */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <AnimatePresence>
          {sparkles.map((sparkle) => {
            const rad = (sparkle.angle * Math.PI) / 180;
            return (
              <motion.div
                key={sparkle.id}
                initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1.2,
                  x: Math.cos(rad) * 50,
                  y: Math.sin(rad) * 50 - 20,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute text-sm"
                style={{ color: sparkle.color }}
              >
                {'\u2728'}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <motion.div
        animate={jiggle ? { rotate: [0, -1, 1, -1, 0] } : { rotate: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <svg
          viewBox="0 0 200 240"
          className="w-[58%] max-w-[260px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="jarGlass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F0F4FF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#E8EDF8" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="jarShine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <clipPath id="jarClip">
              <path d="M38 55 Q38 48 46 45 L154 45 Q162 48 162 55 L162 190 Q162 208 140 210 L60 210 Q38 208 38 190 Z" />
            </clipPath>
          </defs>

          {/* Glow ring when dragging over */}
          {glowing && (
            <ellipse
              cx="100" cy="130" rx="90" ry="105"
              fill="none"
              stroke="#7C5CFC"
              strokeWidth="3"
              className="jar-glow"
            />
          )}

          {/* Jar lid / rim */}
          <rect x="30" y="28" width="140" height="14" rx="4" fill="#D1CFC9" />
          <rect x="32" y="30" width="136" height="10" rx="3" fill="#E8E6E1" />
          <rect x="36" y="31" width="80" height="4" rx="2" fill="#F2F0EC" opacity="0.7" />

          {/* Jar mouth */}
          <path
            d="M34 42 L34 50 Q34 55 42 55 L158 55 Q166 55 166 50 L166 42 Q166 38 158 38 L42 38 Q34 38 34 42 Z"
            fill="url(#jarGlass)"
            stroke="#C8C5BD"
            strokeWidth="1"
          />

          {/* Jar body */}
          <path
            d="M38 55 Q38 48 46 45 L154 45 Q162 48 162 55 L162 190 Q162 210 140 212 L60 212 Q38 210 38 190 Z"
            fill="url(#jarGlass)"
            stroke="#C8C5BD"
            strokeWidth="1.2"
          />

          {/* Coins (clipped inside jar) with idle float */}
          <g clipPath="url(#jarClip)">
            {coins.map((coin, i) => {
              const color = COIN_COLORS[coin.colorIndex];
              const dur = 2.5 + (i % 5) * 0.4;
              const delay = (i % 7) * 0.3;
              return (
                <g
                  key={i}
                  className="coin-idle"
                  style={{ '--dur': `${dur}s`, '--delay': `${delay}s` } as React.CSSProperties}
                >
                  <circle cx={coin.cx} cy={coin.cy + 2} r={coin.r} fill={color.shadow} opacity="0.4" />
                  <circle cx={coin.cx} cy={coin.cy} r={coin.r} fill={color.fill} />
                  <circle cx={coin.cx} cy={coin.cy} r={coin.r - 3} fill="none" stroke={color.shadow} strokeWidth="0.8" opacity="0.5" />
                  <text
                    x={coin.cx}
                    y={coin.cy + 1.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="7"
                    fill={color.shadow}
                    opacity="0.6"
                  >
                    {'\u2605'}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Glass shine highlight */}
          <path d="M48 60 Q50 58 52 60 L52 120 Q50 122 48 120 Z" fill="url(#jarShine)" opacity="0.5" />
          <path d="M56 65 Q57 63 58 65 L58 100 Q57 102 56 100 Z" fill="url(#jarShine)" opacity="0.3" />
        </svg>
      </motion.div>

      <p className="mt-1 text-sm font-semibold text-text-muted">
        {kidName}&apos;s Jar
      </p>
    </div>
  );
}
