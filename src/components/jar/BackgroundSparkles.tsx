import { useMemo } from 'react';

const SPARKLE_COUNT = 10;

interface SparkleData {
  id: number;
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
  minOpacity: number;
  maxOpacity: number;
}

export default function BackgroundSparkles() {
  const sparkles = useMemo<SparkleData[]>(() => {
    return Array.from({ length: SPARKLE_COUNT }, (_, i) => {
      // Deterministic but varied positioning
      const seed1 = ((i * 137 + 73) % 100) / 100;
      const seed2 = ((i * 251 + 41) % 100) / 100;
      const seed3 = ((i * 89 + 17) % 100) / 100;
      return {
        id: i,
        x: 5 + seed1 * 90, // 5-95% of width
        y: 5 + seed2 * 90, // 5-95% of height
        size: 2 + seed3 * 2, // 2-4px
        dur: 2 + seed3 * 2, // 2-4s cycle
        delay: seed1 * 3, // stagger
        minOpacity: 0.15 + seed2 * 0.1,
        maxOpacity: 0.5 + seed3 * 0.3,
      };
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="sparkle-particle absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            '--sparkle-dur': `${s.dur}s`,
            '--sparkle-delay': `${s.delay}s`,
            '--sparkle-min': `${s.minOpacity}`,
            '--sparkle-max': `${s.maxOpacity}`,
          } as React.CSSProperties}
        >
          {/* 4-pointed star shape via SVG */}
          <svg
            viewBox="0 0 10 10"
            width={s.size * 3}
            height={s.size * 3}
            style={{ marginLeft: -s.size, marginTop: -s.size }}
          >
            <path
              d="M5 0 L5.7 3.5 L10 5 L5.7 6.5 L5 10 L4.3 6.5 L0 5 L4.3 3.5 Z"
              fill="white"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
