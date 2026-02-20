import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import RewardCard from '@/components/rewards/RewardCard';
import RedeemSheet from '@/components/rewards/RedeemSheet';
import AddRewardSheet from '@/components/rewards/AddRewardSheet';
import { useKids } from '@/hooks/useKids';
import { db, createReward, createRedemption } from '@/lib/db';
import type { Reward } from '@/lib/types';

const HOUSEHOLD_ID = 'household-1';

export default function RewardsPage() {
  const { selectedKid, balance, refreshBalance } = useKids();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedeem, setShowRedeem] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const rewards = useLiveQuery(
    () => db.rewards.where('householdId').equals(HOUSEHOLD_ID).filter((r) => r.isActive).toArray(),
    [],
    [] as Reward[],
  );

  const handleRedeem = async () => {
    if (!selectedReward || !selectedKid) return;
    await createRedemption({
      id: `redemption-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      rewardId: selectedReward.id,
      kidId: selectedKid.id,
      pointsSpent: selectedReward.pointsCost,
      redeemedAt: Date.now(),
    });
    await refreshBalance();
  };

  const handleAddReward = async (data: { title: string; pointsCost: number; icon: string }) => {
    await createReward({
      id: `reward-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      householdId: HOUSEHOLD_ID,
      title: data.title,
      pointsCost: data.pointsCost,
      icon: data.icon,
      category: 'custom',
      isActive: true,
      createdAt: Date.now(),
    });
  };

  return (
    <div className="flex min-h-full flex-col pb-2">
      {/* Header */}
      <div className="px-5 pt-4 pb-4">
        <h1 className="text-2xl font-bold text-text">Rewards</h1>
        {selectedKid && (
          <p className="mt-1 text-sm text-text-muted">
            <span className="font-bold text-text">{selectedKid.name}</span> has{' '}
            <span className="font-extrabold text-amber-600">{balance} {'\u2B50'}</span>
          </p>
        )}
      </div>

      {/* Reward grid */}
      <div className="flex-1 px-5">
        {rewards.length === 0 ? (
          <motion.div
            className="flex flex-1 flex-col items-center justify-center gap-2 pt-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <motion.span
              className="text-3xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {'\u{1F381}'}
            </motion.span>
            <p className="text-sm text-text-muted">No rewards yet</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {rewards.map((reward, i) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
              >
                <RewardCard
                  reward={reward}
                  canAfford={balance >= reward.pointsCost}
                  onTap={() => {
                    setSelectedReward(reward);
                    setShowRedeem(true);
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        onClick={() => setShowAdd(true)}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-20 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white"
        style={{ boxShadow: '0 4px 14px rgba(124, 92, 252, 0.35)' }}
      >
        <Plus size={26} strokeWidth={2.5} />
      </motion.button>

      {/* Redeem sheet */}
      <RedeemSheet
        open={showRedeem}
        onClose={() => {
          setShowRedeem(false);
          setSelectedReward(null);
        }}
        reward={selectedReward}
        kidName={selectedKid?.name ?? ''}
        balance={balance}
        onConfirm={handleRedeem}
      />

      {/* Add reward sheet */}
      <AddRewardSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAddReward}
      />
    </div>
  );
}
