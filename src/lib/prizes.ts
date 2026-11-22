export interface Prize {
  label: string;
  color: string;
  textColor: string;
  isZonk: boolean;
}

const ZONK: Prize = { label: 'ZONK', color: '#e5383b', textColor: '#ffffff', isZonk: true };
const CUBE: Prize = { label: 'PACKING CUBE', color: '#2f6bff', textColor: '#ffffff', isZonk: false };
const POUCH: Prize = { label: 'MESH POUCH', color: '#16a34a', textColor: '#ffffff', isZonk: false };
const GRAND: Prize = { label: 'GRANDPRIZE', color: '#f5b700', textColor: '#2a1a00', isZonk: false };

/**
 * Setiap entri = satu segmen roda (peluang sama per segmen).
 * Jumlah: 5 ZONK, 4 MESH POUCH, 3 PACKING CUBE, 1 GRANDPRIZE (total 13 segmen).
 * Urutan disebar agar segmen sejenis tidak bersebelahan.
 */
export const PRIZES: readonly Prize[] = [
  ZONK, POUCH, ZONK, CUBE, ZONK, POUCH, ZONK, CUBE, ZONK, POUCH, GRAND, CUBE, POUCH,
];
