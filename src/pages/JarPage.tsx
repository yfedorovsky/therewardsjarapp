import { useState, useCallback, useRef } from 'react';
import TopBar from '@/components/jar/TopBar';
import CoinJar from '@/components/jar/CoinJar';
import QuickAddCoins, { type CoinOrigin } from '@/components/jar/QuickAddCoins';
import FlyingCoin, { type FlyingCoinData } from '@/components/jar/FlyingCoin';
import CustomAmountModal from '@/components/jar/CustomAmountModal';
import BackgroundSparkles from '@/components/jar/BackgroundSparkles';
import { useKids } from '@/hooks/useKids';
import { addManualPoints } from '@/lib/db';
import { playCoinArc } from '@/lib/sounds';

export default function JarPage() {
  const { selectedKid, balance, refreshBalance } = useKids();
  const [modalOpen, setModalOpen] = useState(false);
  const [jarGlowing, setJarGlowing] = useState(false);
  const [flyingCoins, setFlyingCoins] = useState<FlyingCoinData[]>([]);
  const jarRef = useRef<HTMLDivElement>(null);

  const handleAddPoints = useCallback(async (points: number, origin?: CoinOrigin) => {
    if (!selectedKid) return;

    if (origin && jarRef.current) {
      const jarRect = jarRef.current.getBoundingClientRect();
      const endX = jarRect.left + jarRect.width / 2;
      const endY = jarRect.top + jarRect.height * 0.2;

      const coin: FlyingCoinData = {
        id: Date.now() + Math.random(),
        startX: origin.x,
        startY: origin.y,
        endX,
        endY,
        value: origin.value,
      };
      setFlyingCoins((prev) => [...prev, coin]);
      playCoinArc();
    }

    await addManualPoints(selectedKid.id, points);
    await refreshBalance();
  }, [selectedKid, refreshBalance]);

  const handleCoinLanded = useCallback((id: number) => {
    setFlyingCoins((prev) => prev.filter((c) => c.id !== id));
  }, []);

  if (!selectedKid) return null;

  return (
    <div className="relative flex min-h-full flex-col">
      {/* Ambient background sparkles */}
      <BackgroundSparkles />

      <TopBar />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-4">
        <div ref={jarRef}>
          <CoinJar points={balance} kidName={selectedKid.name} glowing={jarGlowing} />
        </div>
        <QuickAddCoins
          onAdd={handleAddPoints}
          onCustom={() => setModalOpen(true)}
          onDragStateChange={setJarGlowing}
        />
      </div>

      {/* Flying coin overlay */}
      <FlyingCoin coins={flyingCoins} onComplete={handleCoinLanded} />

      <CustomAmountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleAddPoints}
        kidName={selectedKid.name}
      />
    </div>
  );
}
