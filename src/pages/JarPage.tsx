import { useState, useCallback } from 'react';
import TopBar from '@/components/jar/TopBar';
import CoinJar from '@/components/jar/CoinJar';
import QuickAddCoins from '@/components/jar/QuickAddCoins';
import CustomAmountModal from '@/components/jar/CustomAmountModal';
import { useKids } from '@/hooks/useKids';
import { addManualPoints } from '@/lib/db';

export default function JarPage() {
  const { selectedKid, balance, refreshBalance } = useKids();
  const [modalOpen, setModalOpen] = useState(false);
  const [jarGlowing, setJarGlowing] = useState(false);

  const handleAddPoints = useCallback(async (points: number) => {
    if (!selectedKid) return;
    await addManualPoints(selectedKid.id, points);
    await refreshBalance();
  }, [selectedKid, refreshBalance]);

  if (!selectedKid) return null;

  return (
    <div className="flex min-h-full flex-col">
      <TopBar />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-4">
        <CoinJar points={balance} kidName={selectedKid.name} glowing={jarGlowing} />
        <QuickAddCoins
          onAdd={handleAddPoints}
          onCustom={() => setModalOpen(true)}
          onDragStateChange={setJarGlowing}
        />
      </div>

      <CustomAmountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleAddPoints}
        kidName={selectedKid.name}
      />
    </div>
  );
}
