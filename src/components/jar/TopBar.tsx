import { Star } from 'lucide-react';
import { useKids } from '@/hooks/useKids';
import AnimatedPoints from './AnimatedPoints';

export default function TopBar() {
  const { kids, selectedKid, selectKid, balance } = useKids();

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
                onClick={() => selectKid(kid.id)}
                className="flex items-center gap-2"
              >
                <div
                  className="flex items-center justify-center rounded-full text-xl transition-all duration-200"
                  style={{
                    width: 44,
                    height: 44,
                    boxShadow: isSelected
                      ? '0 0 0 3px #FFD966'
                      : '0 0 0 2px #E8E6E1',
                  }}
                >
                  {kid.avatar}
                </div>
                {isSelected && (
                  <span className="text-sm font-bold text-text">
                    {kid.name}
                  </span>
                )}
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
