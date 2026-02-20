import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Shell from '@/components/layout/Shell';
import BottomNav from '@/components/layout/BottomNav';
import { seedDatabase } from '@/lib/seed';
import { KidProvider } from '@/hooks/useKids';
import { ToastProvider } from '@/components/shared/Toast';
import type { TabId } from '@/lib/constants';

const JarPage = lazy(() => import('@/pages/JarPage'));
const HouseholdPage = lazy(() => import('@/pages/HouseholdPage'));
const TasksPage = lazy(() => import('@/pages/TasksPage'));
const RewardsPage = lazy(() => import('@/pages/RewardsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

const PAGES: Record<TabId, React.LazyExoticComponent<React.FC>> = {
  jar: JarPage,
  household: HouseholdPage,
  tasks: TasksPage,
  rewards: RewardsPage,
  settings: SettingsPage,
};

/** Background gradient per tab */
const TAB_BACKGROUNDS: Record<TabId, string> = {
  jar: 'radial-gradient(ellipse at 50% 30%, #B066FF 0%, #7B2FBE 50%, #5B1F9E 100%)',
  household: 'linear-gradient(180deg, #F0F4F8 0%, #FFFFFF 50%)',
  tasks: 'linear-gradient(180deg, #FAF9F6 0%, #FFFFFF 60%)',
  rewards: 'linear-gradient(180deg, #FFF8E7 0%, #FFFFFF 50%)',
  settings: '#FAFAFA',
};

const HOUSEHOLD_ID = 'household-1';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('jar');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDatabase().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center bg-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-4xl">{'\u{1F3FA}'}</span>
          <p className="text-sm font-semibold text-text-muted">Loading...</p>
        </motion.div>
      </div>
    );
  }

  const Page = PAGES[activeTab];

  return (
    <ToastProvider>
      <KidProvider householdId={HOUSEHOLD_ID}>
        <Shell nav={<BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}>
          <Suspense fallback={null}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex min-h-full flex-col"
                style={{ background: TAB_BACKGROUNDS[activeTab] }}
              >
                <Page />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </Shell>
      </KidProvider>
    </ToastProvider>
  );
}
