import { Star } from 'lucide-react';
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
        {kids.map((kid, i) => {
          const isSelected = selectedKid?.id === kid.id;
          return (
            <div key={kid.id} className="flex items-center gap-2">
              {i > 0 && (
                <div className="mx-0.5 h-7 w-px bg-border" />
              )}
              <button
                onClick={() => handleSelectKid(kid.id)}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{
                    scale: isSelected ? 1.15 : 0.9,
                    opacity: isSelected ? 1 : 0.65,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="flex items-center justify-center rounded-full text-xl"
                  style={{
                    width: 44,
                    height: 44,
                    boxShadow: isSelected
                      ? `0 0 0 3px ${kid.color}`
                      : '0 0 0 2px #E8E6E1',
                    filter: isSelected ? 'none' : 'saturate(0.5)',
                  }}
                >
                  {kid.avatar}
                </motion.div>
                <AnimatePresence mode="wait">
                  {isSelected && (
                    <motion.span
                      key={kid.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-bold text-text"
                    >
                      {kid.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          );
        })}
      </div>

      {/* Points display */}
      <div className="flex items-center gap-1.5">
        <Star size={20} fill="#FFD966" stroke="#E8C84A" strokeWidth={1.5} />
        <AnimatedPoints value={balance} />
      </div>
    </div>
  );
}
