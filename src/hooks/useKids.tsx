import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getKids, getKidBalance } from '@/lib/db';
import type { Kid } from '@/lib/types';

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
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);

  const selectedKid = kids.find((k) => k.id === selectedKidId) ?? null;

  const refreshKids = useCallback(async () => {
    const loaded = await getKids(householdId);
    setKids(loaded);
    // If selected kid was deleted, pick the first one
    if (loaded.length > 0 && !loaded.find((k) => k.id === selectedKidId)) {
      setSelectedKidId(loaded[0].id);
    }
    // If no kid selected yet, pick first
    if (loaded.length > 0 && !selectedKidId) {
      setSelectedKidId(loaded[0].id);
    }
  }, [householdId, selectedKidId]);

  useEffect(() => {
    refreshKids();
  }, [refreshKids]);

  const refreshBalance = useCallback(async () => {
    if (selectedKidId) {
      const b = await getKidBalance(selectedKidId);
      setBalance(b);
    }
  }, [selectedKidId]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const selectKid = useCallback((id: string) => {
    setSelectedKidId(id);
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
