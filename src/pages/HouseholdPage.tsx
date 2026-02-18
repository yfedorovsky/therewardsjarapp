import { motion } from 'framer-motion';
import KidOverviewCard from '@/components/household/KidOverviewCard';
import ActivityFeed from '@/components/household/ActivityFeed';
import { useKids } from '@/hooks/useKids';

export default function HouseholdPage() {
  const { kids, selectedKid, selectKid } = useKids();

  return (
    <div className="flex min-h-full flex-col pb-2">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <h1 className="text-2xl font-bold text-text">Family</h1>
      </div>

      {/* Kid overview cards */}
      <div className="flex gap-3 px-5">
        {kids.map((kid, i) => (
          <motion.div
            key={kid.id}
            className="flex-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.25 }}
          >
            <KidOverviewCard
              kid={kid}
              isSelected={selectedKid?.id === kid.id}
              onTap={() => selectKid(kid.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Activity feed */}
      <div className="mt-5 px-5">
        <h2 className="mb-2 text-base font-bold text-text">Recent Activity</h2>
      </div>
      <div className="flex-1 px-2">
        <ActivityFeed kidId={selectedKid?.id ?? null} />
      </div>
    </div>
  );
}
