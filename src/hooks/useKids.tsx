import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getKidBalance } from '@/lib/db';
import type { Kid } from '@/lib/types';

const SELECTED_KID_KEY = 'selectedKidId';

interface KidContextValue {
  kids: Kid[];
  selectedKid: Kid | null;
  selectKid: (id: string) => void;
  balance: number;
  refreshBalance: () => Promise<void>;
  refreshKids: () => Promise<void>;
}

const KidContext = createContext<KidContextValue | null>(null);

export function KidProvider({ householdId, children }: { householdId: string; children: ReactNode }) {
  const [selectedKidId, setSelectedKidId] = useState<string | null>(() => {
    return localStorage.getItem(SELECTED_KID_KEY);
  });
  const [balance, setBalance] = useState(0);

  // Live query: kids list auto-updates when DB changes
  const kids = useLiveQuery(
    () => db.kids.where('householdId').equals(householdId).sortBy('order'),
    [householdId],
    [] as Kid[],
  );

  const selectedKid = kids.find((k) => k.id === selectedKidId) ?? null;

  // Auto-select first kid if none selected or selected kid was deleted
  useEffect(() => {
    if (kids.length > 0 && !kids.find((k) => k.id === selectedKidId)) {
      const firstId = kids[0].id;
      setSelectedKidId(firstId);
      localStorage.setItem(SELECTED_KID_KEY, firstId);
    }
  }, [kids, selectedKidId]);

  // Live query: recompute balance whenever completions or redemptions change for selected kid
  const liveBalance = useLiveQuery(
    async () => {
      if (!selectedKidId) return 0;
      return getKidBalance(selectedKidId);
    },
    [selectedKidId],
    0,
  );

  // Keep local balance in sync with live query
  useEffect(() => {
    setBalance(liveBalance);
  }, [liveBalance]);

  // refreshBalance still works for imperative callers (backward compat)
  const refreshBalance = useCallback(async () => {
    if (selectedKidId) {
      const b = await getKidBalance(selectedKidId);
      setBalance(b);
    }
  }, [selectedKidId]);

  // refreshKids is now a no-op since useLiveQuery handles it, but kept for backward compat
  const refreshKids = useCallback(async () => {
    // useLiveQuery auto-updates kids — this is a no-op for backward compat
  }, []);

  const selectKid = useCallback((id: string) => {
    setSelectedKidId(id);
    localStorage.setItem(SELECTED_KID_KEY, id);
  }, []);

  return (
    <KidContext.Provider value={{ kids, selectedKid, selectKid, balance, refreshBalance, refreshKids }}>
      {children}
    </KidContext.Provider>
  );
}

export function useKids() {
  const ctx = useContext(KidContext);
  if (!ctx) throw new Error('useKids must be used within KidProvider');
  return ctx;
}
