import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

interface AnimatedPointsProps {
  value: number;
}

export default function AnimatedPoints({ value }: AnimatedPointsProps) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number>(0);
  const controls = useAnimationControls();

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;

    if (from === to) {
      setDisplay(to);
      return;
    }

    // Scale-pop animation when value changes
    controls.start({
      scale: [1, 1.25, 1],
      transition: { duration: 0.25, ease: 'easeOut' },
    });

    const duration = 300;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, controls]);

  return (
    <motion.span
      animate={controls}
      className="text-lg font-extrabold tabular-nums text-white"
      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
    >
      {display}
    </motion.span>
  );
}
