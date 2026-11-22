/**
 * Konvensi sudut: derajat searah jarum jam, 0° = arah atas (posisi pointer).
 * Segmen i menempati [i*S, (i+1)*S) pada roda yang belum diputar.
 * Jika roda diputar R derajat searah jarum jam, titik roda di bawah pointer
 * adalah (360 - R) mod 360. Agar pointer menunjuk titik P, R ≡ -P (mod 360).
 */

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Integer acak seragam [0, max) memakai crypto.getRandomValues (rejection sampling, tanpa bias). */
export function secureRandomInt(max: number): number {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

/** Float acak [0, 1) memakai crypto.getRandomValues. */
export function secureRandomFloat(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 0x100000000;
}

/**
 * Hitung rotasi akhir (kumulatif) agar pointer berhenti di dalam segmen `index`.
 * Offset acak dibatasi 70% dari lebar segmen agar tidak pernah menyentuh garis batas.
 */
export function computeTargetRotation(
  currentRotation: number,
  index: number,
  segmentCount: number,
  extraSpins: number,
): number {
  const segAngle = 360 / segmentCount;
  const jitter = (secureRandomFloat() - 0.5) * segAngle * 0.7;
  const pointAt = index * segAngle + segAngle / 2 + jitter;
  const desiredMod = mod(-pointAt, 360);
  const delta = mod(desiredMod - currentRotation, 360);
  return currentRotation + extraSpins * 360 + delta;
}

/** Segmen yang berada di bawah pointer untuk rotasi tertentu (dipakai untuk verifikasi). */
export function segmentAtPointer(rotation: number, segmentCount: number): number {
  const segAngle = 360 / segmentCount;
  return Math.floor(mod(-rotation, 360) / segAngle) % segmentCount;
}

export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
