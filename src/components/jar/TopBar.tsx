import { Star, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKids } from '@/hooks/useKids';
import AnimatedPoints from './AnimatedPoints';
import { hapticLight } from '@/lib/haptics';
import { playKidSwitch } from '@/lib/sounds';

export default function TopBar() {
  const { kids, selectedKid, selectKid, balance } = useKids();

  const handleSelectKid = (id: string) => {
    if (selectedKid?.id !== id) {
      hapticLight();
      playKidSwitch();
    }
    selectKid(id);
  };

  return (
    <div className="flex items-center justify-between px-5 py-3">
      {/* Kid avatars */}
      <div className="flex items-center gap-2">
        {kids.map((kid) => {
          const isSelected = selectedKid?.id === kid.id;
          return (
            <button
              key={kid.id}
              onClick={() => handleSelectKid(kid.id)}
              className="flex flex-col items-center gap-1"
            >
              <motion.div
                animate={{
                  scale: isSelected ? 1.1 : 0.85,
                  opacity: isSelected ? 1 : 0.7,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex items-center justify-center rounded-full text-xl"
                style={{
                  width: 44,
                  height: 44,
                  background: 'rgba(255,255,255,0.1)',
                  boxShadow: isSelected
                    ? `0 0 0 3px ${kid.color}, 0 0 12px ${kid.color}40`
                    : '0 0 0 2px rgba(255,255,255,0.2)',
                  filter: isSelected ? 'none' : 'saturate(0.5)',
                }}
              >
                {kid.avatar}
              </motion.div>
              <AnimatePresence mode="wait">
                {isSelected && (
                  <motion.span
                    key={kid.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs font-semibold text-white"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                  >
                    {kid.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      {/* Points badge */}
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1.5"
        style={{
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <Star size={18} fill="#FFD966" stroke="#E8C84A" strokeWidth={1.5} />
        <AnimatedPoints value={balance} />
        <ChevronRight size={14} className="text-white/40" />
      </div>
    </div>
  );
}
