/* ======================================================================
   KONFIGURASI RUANGAN
   Ukuran dasar ruangan & palet warna yang dipakai di seluruh modul lain.
   Sumbu: X = lebar ruangan (0..W), Z = panjang ruangan (0..L), Y = tinggi
   Z=0   : dinding LAYAR (screen wall / depan)
   Z=L   : dinding LEMARI ARSIP (belakang)
   X=0   : dinding KIRI (rak + jendela)
   X=W   : dinding KANAN (jendela)
   ====================================================================== */

export const ROOM_W = 8;    // lebar
export const ROOM_L = 12;   // panjang
export const ROOM_H = 3.2;  // tinggi plafon
export const SPLIT_Y = 1.0; // batas warna dinding krem/abu-abu
export const BOSS_DESK_Z = ROOM_L - 2.0;

export const COLORS = {
  creamWall: 0xF7EBCB,
  darkWallBase: 0x4e4e4e,
  ceiling: 0xF9F1D7,
  floor: 0xEEDDB2,
  woodDark: 0xE9D7A9,
  woodMid: 0xF1E1B5,
  woodLight: 0xF8F0D1,
  orange: 0xc85a1e,
  black: 0x141414,
  chairBlack: 0x1b1b1d,
  curtain: 0x2e2015,
  glassDark: 0x0e1512,
  metalBlack: 0x1a1a1c,
  white: 0xf5f2ea,
};
