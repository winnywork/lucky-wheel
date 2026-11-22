import { useCallback, useRef, useState } from 'react';
import Wheel, { type WheelHandle } from '../components/Wheel';
import ResultModal from '../components/ResultModal';
import Confetti from '../components/Confetti';
import { PRIZES, type Prize } from '../lib/prizes';
import { secureRandomInt } from '../lib/wheelMath';

export default function HomePage() {
  const wheelRef = useRef<WheelHandle>(null);
  const lockRef = useRef(false); // guard sinkron: mencegah klik ganda sebelum state ter-render
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
  const [glow, setGlow] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const spin = useCallback(async () => {
    if (lockRef.current) return;
    lockRef.current = true;
    setSpinning(true);
    setResult(null);
    setGlow(false);

    const index = secureRandomInt(PRIZES.length);
    await wheelRef.current?.spinTo(index);

    const prize = PRIZES[index];
    setGlow(true);
    if (!prize.isZonk) setConfettiKey((k) => k + 1);
    setSpinning(false);
    lockRef.current = false;
    // jeda singkat agar efek glow terlihat sebelum popup
    window.setTimeout(() => setResult(prize), 500);
  }, []);

  const closeModal = useCallback(() => {
    setResult(null);
    setGlow(false);
  }, []);

  return (
    <main className="page">
      <header className="header">
        <h1 className="title">Biznet GioCloud</h1>
        <p className="subtitle">Spin the Wheel, Win Your Prize!</p>
      </header>

      <Wheel ref={wheelRef} prizes={PRIZES} spinning={spinning} glow={glow} />

      <button className="btn btn-primary btn-spin" onClick={spin} disabled={spinning || result !== null}>
        {spinning ? 'BERPUTAR...' : 'PUTAR SEKARANG'}
      </button>

      <ResultModal prize={result} onClose={closeModal} />
      <Confetti key={confettiKey} active={confettiKey > 0} />
    </main>
  );
}
