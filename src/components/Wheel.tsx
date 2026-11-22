import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { Prize } from '../lib/prizes';
import { computeTargetRotation, easeOutQuart, segmentAtPointer } from '../lib/wheelMath';

export interface WheelHandle {
  /** Putar roda hingga berhenti di segmen `index`. Resolve setelah animasi selesai. */
  spinTo: (index: number) => Promise<void>;
}

interface WheelProps {
  prizes: readonly Prize[];
  spinning: boolean;
  glow: boolean;
}

const SIZE = 500;
const C = SIZE / 2;
const R = 238;
const SPIN_MS = 5500;
const EXTRA_SPINS = 6;

const pt = (angleDeg: number, radius: number) => {
  const a = (angleDeg * Math.PI) / 180;
  return { x: C + radius * Math.sin(a), y: C - radius * Math.cos(a) };
};

const Wheel = forwardRef<WheelHandle, WheelProps>(function Wheel({ prizes, spinning, glow }, ref) {
  const rotorRef = useRef<SVGGElement>(null);
  const rotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const n = prizes.length;
  const seg = 360 / n;

  const apply = (deg: number) => {
    rotorRef.current?.setAttribute('transform', `rotate(${deg} ${C} ${C})`);
  };

  useImperativeHandle(ref, () => ({
    spinTo: (index: number) =>
      new Promise<void>((resolve) => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        const start = rotationRef.current;
        const target = computeTargetRotation(start, index, n, EXTRA_SPINS);
        const t0 = performance.now();

        const frame = (now: number) => {
          const t = Math.min((now - t0) / SPIN_MS, 1);
          const deg = start + (target - start) * easeOutQuart(t);
          rotationRef.current = deg;
          apply(deg);
          if (t < 1) {
            rafRef.current = requestAnimationFrame(frame);
          } else {
            rafRef.current = null;
            rotationRef.current = target;
            apply(target);
            // Jaminan konsistensi: segmen di bawah pointer harus sama dengan hasil random.
            if (segmentAtPointer(target, n) !== index) {
              console.error('Wheel angle mismatch');
            }
            resolve();
          }
        };
        rafRef.current = requestAnimationFrame(frame);
      }),
  }));

  const bulbs = Array.from({ length: 24 }, (_, i) => pt(i * 15, R + 16));

  return (
    <div className={`wheel-wrap${glow ? ' wheel-glow' : ''}${spinning ? ' wheel-spinning' : ''}`}>
      <div className="pointer" aria-hidden="true">
        <svg viewBox="0 0 60 80" width="100%" height="100%">
          <path d="M30 78 L4 18 A28 28 0 1 1 56 18 Z" fill="#e5383b" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
          <circle cx="30" cy="26" r="9" fill="#fff" />
        </svg>
      </div>
      <svg
        className="wheel-svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Roda undian: ${prizes.map((p) => p.label).join(', ')}`}
      >
        <circle cx={C} cy={C} r={R + 24} fill="#2a1a8f" stroke="#f5b700" strokeWidth="6" />
        {bulbs.map((b, i) => (
          <circle
            key={i}
            cx={b.x}
            cy={b.y}
            r="5"
            className={`bulb ${i % 2 === 0 ? 'bulb-a' : 'bulb-b'}`}
          />
        ))}
        <g ref={rotorRef}>
          {prizes.map((p, i) => {
            const a0 = i * seg;
            const a1 = (i + 1) * seg;
            const s = pt(a0, R);
            const e = pt(a1, R);
            const large = seg > 180 ? 1 : 0;
            const mid = a0 + seg / 2;
            return (
              <g key={i}>
                <path
                  d={`M${C} ${C} L${s.x} ${s.y} A${R} ${R} 0 ${large} 1 ${e.x} ${e.y} Z`}
                  fill={p.color}
                  stroke="#ffffff"
                  strokeWidth="3"
                />
                <text
                  x={C + R - 22}
                  y={C}
                  transform={`rotate(${mid - 90} ${C} ${C})`}
                  textAnchor="end"
                  dominantBaseline="central"
                  fill={p.textColor}
                  className="seg-label"
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </g>
        <circle cx={C} cy={C} r="38" fill="#fff" stroke="#f5b700" strokeWidth="8" />
        <circle cx={C} cy={C} r="16" fill="#7c3aed" />
      </svg>
    </div>
  );
});

export default Wheel;
