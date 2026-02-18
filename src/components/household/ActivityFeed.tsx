import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getRecentActivity, getTotalActivityCount, type ActivityItem } from '@/lib/db';
import { timeAgo } from '@/lib/timeAgo';

const PAGE_SIZE = 20;

interface ActivityFeedProps {
  kidId: string | null;
}

export default function ActivityFeed({ kidId }: ActivityFeedProps) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (offset: number = 0) => {
    setLoading(true);
    const [fetched, count] = await Promise.all([
      getRecentActivity(PAGE_SIZE + offset, 0),
      getTotalActivityCount(),
    ]);

    // Filter by kid if specified
    const filtered = kidId ? fetched.filter((item) => item.kidId === kidId) : fetched;

    if (offset === 0) {
      setItems(filtered.slice(0, PAGE_SIZE));
      setTotal(kidId ? filtered.length : count);
    } else {
      setItems(filtered.slice(0, offset + PAGE_SIZE));
      setTotal(kidId ? filtered.length : count);
    }
    setLoading(false);
  }, [kidId]);

  // Reload when kid changes
  useEffect(() => {
    load(0);
  }, [load]);

  const hasMore = items.length < total;

  if (items.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center gap-2 py-10">
        <span className="text-3xl">{'\u{1F4AD}'}</span>
        <p className="text-sm text-text-muted">
          No activity yet. Complete tasks or redeem rewards!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(i * 0.03, 0.5), duration: 0.2 }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg text-base">
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {item.description}
            </p>
            <p className="text-xs text-text-light">{timeAgo(item.timestamp)}</p>
          </div>
          <span
            className={`shrink-0 text-sm font-extrabold ${
              item.points > 0 ? 'text-success' : 'text-danger'
            }`}
          >
            {item.points > 0 ? '+' : ''}{item.points} {'\u2B50'}
          </span>
        </motion.div>
      ))}

      {hasMore && (
        <button
          onClick={() => load(items.length)}
          disabled={loading}
          className="mt-2 self-center rounded-full border border-border px-5 py-2 text-xs font-semibold text-text-muted transition-colors active:bg-bg"
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}
