import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticHeavy } from '@/lib/haptics';
import { playCoinDrop } from '@/lib/sounds';

// Coin color palette with darker borders and lighter star fills
const COIN_PALETTE = [
  { fill: '#FFD966', border: '#D4B44A', star: 'rgba(255,255,255,0.7)' }, // gold
  { fill: '#FF8C42', border: '#D46E2A', star: 'rgba(255,255,255,0.65)' }, // orange
  { fill: '#4ECDC4', border: '#38A89D', star: 'rgba(255,255,255,0.7)' }, // teal
  { fill: '#9B59B6', border: '#7D3F94', star: 'rgba(255,255,255,0.65)' }, // purple
  { fill: '#FF6B6B', border: '#D44E4E', star: 'rgba(255,255,255,0.65)' }, // coral
];

const SPARKLE_COLORS = ['#FFD966', '#FFC107', '#FFE082', '#7C5CFC'];

const MAX_VISUAL_CAPACITY = 500;
const MAX_VISIBLE_COINS = 45;

// The actual jar body path — used for both rendering and clipping
// Mason jar: wide rounded body, slight shoulder narrowing to neck
const JAR_BODY_PATH = 'M44 78 Q40 78 38 92 L36 218 Q36 248 66 250 L134 250 Q164 248 164 218 L162 92 Q160 78 156 78 Z';
const JAR_SHOULDER_PATH = 'M44 78 Q44 66 64 60 L136 60 Q156 66 156 78';

// Coin layout bounds — must be well INSIDE the jar body path
const COIN_BOUNDS = {
  left: 48,
  right: 152,
  bottom: 238,
  top: 85,
};

interface CoinData {
  cx: number;
  cy: number;
  r: number;
  rotation: number;
  colorIndex: number;
}

/**
 * Generate deterministic coin positions that look naturally piled inside the jar.
 * Uses seeded pseudo-random so positions don't shuffle on re-render.
 */
function generateCoins(count: number): CoinData[] {
  if (count === 0) return [];

  const coins: CoinData[] = [];
  const coinRadius = 11;
  const usableWidth = COIN_BOUNDS.right - COIN_BOUNDS.left;

  for (let i = 0; i < count; i++) {
    // Seeded pseudo-random values
    const s1 = ((i * 137 + 73) % 1000) / 1000;
    const s2 = ((i * 251 + 41) % 1000) / 1000;
    const s3 = ((i * 89 + 17) % 1000) / 1000;
    const s4 = ((i * 173 + 59) % 1000) / 1000;

    // Row-based layout with randomness for natural look
    const coinsPerRow = 5;
    const row = Math.floor(i / coinsPerRow);
    const inRow = i % coinsPerRow;

    // Y position: bottom-up, tighter at bottom, looser at top
    const rowHeight = coinRadius * 1.9;
    const baseY = COIN_BOUNDS.bottom - coinRadius - row * rowHeight;
    const jitterY = (s2 - 0.5) * 5;
    const cy = baseY + jitterY;

    // Don't render coins above the fill area
    if (cy < COIN_BOUNDS.top) continue;

    // X position: evenly distributed with jitter, clamped inside bounds
    const slotWidth = usableWidth / coinsPerRow;
    const baseX = COIN_BOUNDS.left + inRow * slotWidth + slotWidth / 2;
    const jitterX = (s1 - 0.5) * slotWidth * 0.5;
    const cx = Math.max(COIN_BOUNDS.left + coinRadius, Math.min(COIN_BOUNDS.right - coinRadius, baseX + jitterX));

    const rotation = (s3 - 0.5) * 30; // -15 to +15 degrees
    const colorIndex = Math.floor(s4 * COIN_PALETTE.length);

    coins.push({ cx, cy, r: coinRadius, rotation, colorIndex });
  }

  return coins;
}

interface Sparkle {
  id: number;
  angle: number;
  color: string;
}

interface CoinJarProps {
  points: number;
  kidName: string;
  glowing?: boolean;
}

export default function CoinJar({ points, kidName, glowing = false }: CoinJarProps) {
  const fillLevel = Math.min(points / MAX_VISUAL_CAPACITY, 1.0);
  const targetCount = Math.min(Math.max(Math.round(fillLevel * MAX_VISIBLE_COINS), 0), MAX_VISIBLE_COINS);

  const [displayCount, setDisplayCount] = useState(targetCount);
  const [jiggle, setJiggle] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const rafRef = useRef(0);
  const prevPoints = useRef(points);

  // Detect points increase → trigger sparkle + jiggle + sound
  useEffect(() => {
    if (points > prevPoints.current && prevPoints.current >= 0) {
      setJiggle(true);
      setTimeout(() => setJiggle(false), 350);

      const newSparkles: Sparkle[] = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        angle: i * 60 + Math.random() * 20 - 10,
        color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
      }));
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 600);

      hapticHeavy();
      playCoinDrop();
    }
    prevPoints.current = points;
  }, [points]);

  // Animate coin count smoothly
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
      {/* Sparkle burst particles */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <AnimatePresence>
          {sparkles.map((sparkle) => {
            const rad = (sparkle.angle * Math.PI) / 180;
            return (
              <motion.div
                key={sparkle.id}
                initial={{ opacity: 1, scale: 0.3, x: 0, y: -20 }}
                animate={{
                  opacity: 0,
                  scale: 1.5,
                  x: Math.cos(rad) * 55,
                  y: Math.sin(rad) * 55 - 30,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute"
              >
                <svg viewBox="0 0 10 10" width="10" height="10">
                  <path
                    d="M5 0 L5.8 3.3 L10 5 L5.8 6.7 L5 10 L4.2 6.7 L0 5 L4.2 3.3 Z"
                    fill={sparkle.color}
                  />
                </svg>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <motion.div
        animate={jiggle ? { rotate: [0, -1.5, 1.5, -1, 0.5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        <svg
          viewBox="0 0 200 280"
          className="w-[65vw] max-w-[280px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Glass fill: semi-transparent purple-tinted */}
            <radialGradient id="jarGlassBody" cx="0.5" cy="0.4" r="0.6">
              <stop offset="0%" stopColor="rgba(220, 200, 255, 0.18)" />
              <stop offset="100%" stopColor="rgba(180, 160, 230, 0.12)" />
            </radialGradient>

            {/* Left shine gradient */}
            <linearGradient id="jarShineLeft" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Right shine gradient */}
            <linearGradient id="jarShineRight" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Inner depth gradient */}
            <radialGradient id="jarInnerGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(100,60,160,0.08)" />
            </radialGradient>

            {/* Clip path using the SAME jar body shape — coins stay perfectly inside */}
            <clipPath id="jarBodyClip">
              <path d={JAR_BODY_PATH} />
            </clipPath>

            {/* Coin star pattern */}
            <symbol id="coinStar" viewBox="0 0 20 20">
              <path d="M10 1 L12.5 7.2 L19 7.8 L14 12.2 L15.5 18.6 L10 15.2 L4.5 18.6 L6 12.2 L1 7.8 L7.5 7.2 Z" />
            </symbol>
          </defs>

          {/* Glow ring when dragging over */}
          {glowing && (
            <ellipse
              cx="100" cy="155" rx="92" ry="110"
              fill="none"
              stroke="#B066FF"
              strokeWidth="3"
              className="jar-glow"
            />
          )}

          {/* ===== JAR BODY ===== */}
          <path
            d={JAR_BODY_PATH}
            fill="url(#jarGlassBody)"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.2"
          />

          {/* Inner depth overlay */}
          <path d={JAR_BODY_PATH} fill="url(#jarInnerGlow)" />

          {/* ===== COINS inside the jar (clipped to body) ===== */}
          <g clipPath="url(#jarBodyClip)">
            {coins.map((coin, i) => {
              const palette = COIN_PALETTE[coin.colorIndex];
              const dur = 2.5 + (i % 5) * 0.4;
              const delay = (i % 7) * 0.3;
              return (
                <g
                  key={i}
                  className="coin-idle"
                  style={{ '--dur': `${dur}s`, '--delay': `${delay}s` } as React.CSSProperties}
                  transform={`rotate(${coin.rotation} ${coin.cx} ${coin.cy})`}
                >
                  {/* Coin shadow */}
                  <ellipse
                    cx={coin.cx}
                    cy={coin.cy + 3}
                    rx={coin.r}
                    ry={coin.r * 0.35}
                    fill="rgba(0,0,0,0.12)"
                  />
                  {/* Coin body */}
                  <circle cx={coin.cx} cy={coin.cy} r={coin.r} fill={palette.fill} />
                  {/* Border ring for 3D disc feel */}
                  <circle
                    cx={coin.cx} cy={coin.cy} r={coin.r - 1}
                    fill="none"
                    stroke={palette.border}
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  {/* Inner highlight for dome feel */}
                  <circle
                    cx={coin.cx - 1.5} cy={coin.cy - 1.5} r={coin.r * 0.55}
                    fill="rgba(255,255,255,0.15)"
                  />
                  {/* Star emblem */}
                  <use
                    href="#coinStar"
                    x={coin.cx - coin.r * 0.5}
                    y={coin.cy - coin.r * 0.5}
                    width={coin.r}
                    height={coin.r}
                    fill={palette.star}
                  />
                </g>
              );
            })}
          </g>

          {/* ===== GLASS HIGHLIGHTS (rendered on top of coins) ===== */}
          {/* Left edge vertical highlight */}
          <path
            d="M48 92 Q46 90 44 92 L42 200 Q44 218 48 200 Z"
            fill="url(#jarShineLeft)"
            opacity="0.5"
          />
          <path
            d="M54 97 Q53 95 52 97 L51 175 Q52 180 54 175 Z"
            fill="url(#jarShineLeft)"
            opacity="0.3"
          />

          {/* Right edge highlight */}
          <path
            d="M156 97 Q158 95 159 97 L160 185 Q158 195 156 185 Z"
            fill="url(#jarShineRight)"
            opacity="0.25"
          />

          {/* ===== JAR NECK & SHOULDER ===== */}
          <path
            d={JAR_SHOULDER_PATH}
            fill="url(#jarGlassBody)"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
          />

          {/* ===== JAR MOUTH / RIM ===== */}
          {/* Outer rim — slightly more opaque glass */}
          <path
            d="M58 58 Q58 50 66 48 L134 48 Q142 50 142 58 Q142 62 134 63 L66 63 Q58 62 58 58 Z"
            fill="rgba(200,180,240,0.28)"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.2"
          />
          {/* Inner rim line (double-line for glass lip thickness) */}
          <path
            d="M62 55 Q62 52 70 51 L130 51 Q138 52 138 55"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="0.8"
          />

          {/* ===== GLASS SHINE MARKS (sparkle glints) ===== */}
          {/* Sparkle 1 - upper left, biggest */}
          <g opacity="0.65">
            <line x1="52" y1="100" x2="52" y2="107" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="48.5" y1="103.5" x2="55.5" y2="103.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          </g>
          {/* Sparkle 2 - mid left */}
          <g opacity="0.4">
            <line x1="56" y1="140" x2="56" y2="144" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="54" y1="142" x2="58" y2="142" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
          </g>
          {/* Sparkle 3 - near shoulder */}
          <g opacity="0.5">
            <line x1="63" y1="83" x2="63" y2="88" stroke="white" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="60.5" y1="85.5" x2="65.5" y2="85.5" stroke="white" strokeWidth="0.9" strokeLinecap="round" />
          </g>
          {/* Sparkle 4 - lower left, small */}
          <g opacity="0.3">
            <line x1="50" y1="175" x2="50" y2="178" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
            <line x1="48.5" y1="176.5" x2="51.5" y2="176.5" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
          </g>
        </svg>
      </motion.div>

      <p className="mt-2 text-sm font-semibold text-white/80" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
        {kidName}&apos;s Jar
      </p>
    </div>
  );
}
