import { useEffect, useRef } from 'react';
import type { Prize } from '../lib/prizes';

interface ResultModalProps {
  prize: Prize | null;
  onClose: () => void;
}

export default function ResultModal({ prize, onClose }: ResultModalProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!prize) return;
    btnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prize, onClose]);

  if (!prize) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`modal ${prize.isZonk ? 'modal-zonk' : 'modal-win'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="result-title" className="modal-title">
          {prize.isZonk ? 'COBA LAGI!' : 'SELAMAT!'}
        </h2>
        <p className="modal-caption">{prize.isZonk ? 'Kamu belum beruntung kali ini' : 'Kamu mendapatkan'}</p>
        <div className="modal-prize" style={{ color: prize.isZonk ? '#ff8a8d' : '#ffd23f' }}>
          {prize.label}
        </div>
        <button ref={btnRef} className="btn btn-primary" onClick={onClose}>
          PUTAR LAGI
        </button>
      </div>
    </div>
  );
}
