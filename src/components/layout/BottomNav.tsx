import { Home, Users, CheckCircle2, Gift, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { NAV_TABS } from '@/lib/constants';
import type { TabId } from '@/lib/constants';
import { hapticLight } from '@/lib/haptics';

const TAB_ICONS: Record<TabId, React.FC<{ size?: number; strokeWidth?: number; className?: string; fill?: string }>> = {
  jar: Home,
  household: Users,
  tasks: CheckCircle2,
  rewards: Gift,
  settings: Settings,
};

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="flex items-stretch bg-surface"
      style={{
        boxShadow: 'var(--shadow-nav)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {NAV_TABS.map((tab) => {
        const Icon = TAB_ICONS[tab.id];
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              hapticLight();
              onTabChange(tab.id);
            }}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 pt-2 pb-1.5"
          >
            <motion.div
              animate={{
                scale: isActive ? 1.05 : 1,
                color: isActive ? '#7C5CFC' : '#9CA3AF',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, duration: 0.2 }}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                fill={isActive ? '#7C5CFC' : 'none'}
                className="transition-colors duration-200"
              />
            </motion.div>
            <span
              className="text-[10px] leading-tight font-semibold transition-colors duration-200"
              style={{ color: isActive ? '#7C5CFC' : '#9CA3AF' }}
            >
              {tab.label}
            </span>

            {/* Active indicator pill */}
            <motion.div
              animate={{
                width: isActive ? 20 : 0,
                opacity: isActive ? 1 : 0,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="h-[3px] rounded-full bg-primary"
              style={{ marginTop: 2 }}
            />
          </button>
        );
      })}
    </nav>
  );
}
