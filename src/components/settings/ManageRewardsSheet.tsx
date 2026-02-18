import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import BottomSheet from '@/components/shared/BottomSheet';
import { getRewards, updateReward, deleteReward } from '@/lib/db';
import type { Reward } from '@/lib/types';

const HOUSEHOLD_ID = 'household-1';

interface ManageRewardsSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function ManageRewardsSheet({ open, onClose }: ManageRewardsSheetProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    if (open) {
      getRewards(HOUSEHOLD_ID).then(setRewards);
    }
  }, [open]);

  const handleToggle = async (reward: Reward) => {
    await updateReward(reward.id, { isActive: !reward.isActive });
    setRewards((prev) => prev.map((r) => (r.id === reward.id ? { ...r, isActive: !r.isActive } : r)));
  };

  const handleDelete = async (id: string) => {
    await deleteReward(id);
    setRewards((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="text-lg font-bold text-text">Manage Rewards</h2>
      <div className="mt-3 max-h-[50vh] overflow-y-auto">
        {rewards.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-muted">No rewards</p>
        ) : (
          <div className="flex flex-col gap-1">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                  reward.isActive ? '' : 'opacity-40'
                }`}
              >
                <span className="text-lg">{reward.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-text">{reward.title}</p>
                  <p className="text-xs text-text-muted">{reward.pointsCost} pts</p>
                </div>
                <button
                  onClick={() => handleToggle(reward)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    reward.isActive
                      ? 'bg-success/15 text-success'
                      : 'bg-bg text-text-muted'
                  }`}
                >
                  {reward.isActive ? 'Active' : 'Off'}
                </button>
                <button
                  onClick={() => handleDelete(reward.id)}
                  className="text-text-light transition-colors active:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
