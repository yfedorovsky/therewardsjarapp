import { Home, Users, CheckCircle, Gift, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { NAV_TABS } from '@/lib/constants';
import type { TabId } from '@/lib/constants';

const TAB_ICONS: Record<TabId, React.FC<{ size?: number; strokeWidth?: number; className?: string }>> = {
  jar: Home,
  household: Users,
  tasks: CheckCircle,
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
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 pt-2 pb-1.5 transition-colors duration-150 ${
              isActive ? 'text-primary' : 'text-text-muted'
            }`}
          >
            <motion.div
              whileTap={{ scale: 1.2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
            </motion.div>
            <span
              className={`text-[10px] leading-tight ${
                isActive ? 'font-bold' : 'font-semibold'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
