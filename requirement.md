# Dokumen Spesifikasi Kebutuhan Sistem (Software Requirements Document)
## Proyek: LUCKY WHEEL - Interactive Event Lucky Draw Platform

---

### 1. Ringkasan Eksekutif & Tujuan Proyek
**LUCKY WHEEL** adalah platform aplikasi web berbasis undian roda keberuntungan (*lucky draw wheel*) yang dirancang khusus untuk kebutuhan acara (*event*, *gathering*, *exhibition*, atau *seminar*). Berbeda dengan *Wheel of Names* konvensional yang mengundi nama peserta, LUCKY WHEEL mengundi **daftar hadiah langsung** yang sedang aktif dan memiliki ketersediaan stok secara *real-time*.

Aplikasi ini dibangun dengan arsitektur monolitik modern berbasis **Next.js App Router**, berjalan dalam satu repositori, satu *deployment unit*, dan satu domain publik.

---

### 2. Aktor & Peran Pengguna (User Roles)

1. **Guest / Public User (Peserta Acara)**
   - Mengakses portal tanpa kewajiban login/registrasi.
   - Mengunjungi halaman *Landing Page* dan *User Portal* (`/wheel`).
   - Melihat visual roda keberuntungan interaktif yang memuat daftar hadiah yang masih tersedia.
   - Melakukan putaran (*spin*) jika sesi undian dibuka oleh admin dan kuota undian sesi pengguna masih tersedia.
   - Menikmati animasi visual dan efek suara (*sound effect / celebration*) ketika hadiah terpilih.

2. **Administrator (Panitia Acara)**
   - Wajib melakukan autentikasi melalui portal `/admin/login`.
   - Mengelola master data hadiah (*Prize Management*): tambah, ubah, hapus/nonaktifkan, dan atur stok hadiah.
   - Mengontrol konfigurasi global acara (*Event Settings*): toggle status undian (buka/tutup), batas maksimal total undian, dan batas undian per sesi pengunjung.
   - Memantau dasbor analitik ringkas (total spin, sisa hadiah, status undian).
   - Melihat dan mengekspor riwayat undian (*Draw History*).

---

### 3. Kebutuhan Fungsional (Functional Requirements)

#### FR-01: Landing Page & Navigasi Publik (`/`)
- Menampilkan identitas acara (Nama Event, Subjudul/Deskripsi Singkat) yang dinamis dari basis data.
- Menampilkan indikator status undian (Sedang Berlangsung / Ditutup Sementara / Acara Berakhir).
- Menyediakan tombol *Call to Action* (CTA) untuk langsung menuju `/wheel`.
- Menyediakan tautan akses administratif menuju `/admin/login`.

#### FR-02: User Wheel Portal (`/wheel`)
- **Render Roda Interaktif**: Menggambar roda keberuntungan menggunakan HTML5 Canvas / SVG secara responsif (mendukung desktop, tablet, dan smartphone).
- **Segmentasi Dinamis**: Jumlah juring roda menyesuaikan secara otomatis dengan jumlah jenis hadiah yang berstatus aktif (`isActive = true`) dan memiliki stok (`stock > 0`).
- **Pemberian Identitas Visual**: Setiap juring memiliki warna kontras, label nama hadiah, dan ikon/gambar (opsional).
- **Session Identification**: Mengidentifikasi sesi browser publik melalui *signed HTTP-only cookie* atau UUID sesi unik untuk membatasi jumlah putaran per perangkat.
- **Informasi Sesi**: Menampilkan sisa kesempatan memutar bagi pengguna saat ini (`Remaining Spins`).
- **Trigger Spin**: Tombol "PUTAR SEKARANG" hanya dapat diklik jika:
  - Undian berstatus aktif (`isDrawActive = true`).
  - Total undian belum melebihi `maxTotalDraws`.
  - Sesi pengguna belum mencapai `maxDrawsPerSession`.
  - Masih ada hadiah aktif dengan stok > 0.
- **Sinkronisasi Animasi**: Frontend tidak menentukan pemenang. Frontend mengirim permintaan putar ke backend, menerima indeks/ID hadiah pemenang dari respons aman, lalu menjalankan animasi deselerasi (*easing*) tepat berhenti pada juring pemenang.
- **Modal Kemenangan**: Menampilkan dialog pop-up konfirmasi hadiah yang didapatkan lengkap dengan efek selebrasi (konfeti/suara).

#### FR-03: Mesin Undian Server-Authoritative (`/api/draw/spin`)
- Memvalidasi seluruh prasyarat bisnis sebelum menentukan hasil.
- Memilih hadiah secara acak dengan algoritma *Cryptographically Secure Pseudo-Random Number Generator* (CSPRNG).
- Memotong stok hadiah secara atomik di dalam transaksi database ACID untuk mengeliminasi *race condition*.
- Mencatat riwayat undian (`Draw`) dengan status berhasil beserta stempel waktu dan ID sesi.
- Mengembalikan *payload* hasil undian (ID hadiah, nama hadiah, indeks juring, dan sudut rotasi target) ke frontend.

#### FR-04: Autentikasi & Sesi Admin (`/admin/login`, `/api/admin/auth/*`)
- Autentikasi berbasis username dan password dengan proteksi *rate limiting* untuk mencegah serangan *brute-force*.
- Verifikasi password menggunakan algoritma *hashing* aman (Argon2id atau Bcrypt).
- Pengelolaan sesi admin menggunakan *encrypted HTTP-only, Secure, SameSite cookie*.
- *Middleware* Next.js memproteksi seluruh rute `/admin/*` (kecuali `/admin/login`) agar pengguna tanpa sesi sah dialihkan otomatis.

#### FR-05: Manajemen Master Hadiah (`/admin/prizes`)
- Menampilkan tabel seluruh hadiah dengan informasi: Nama, Deskripsi, URL Gambar, Stok Tersedia, Status Aktif/Nonaktif, dan Tanggal Dibuat.
- Form tambah dan ubah hadiah dengan validasi skema Zod (nama wajib diisi, stok integer >= 0).
- Fitur *toggle switch* instan untuk mengaktifkan/menonaktifkan hadiah tanpa menghapus data.
- Fitur penyesuaian stok (*quick stock update*).
- Penghapusan aman (*safe delete* / *soft validation*): Hadiah yang sudah memiliki riwayat undian tidak boleh dihapus secara permanen (*hard delete*), melainkan dinonaktifkan guna menjaga integritas riwayat.

#### FR-06: Riwayat Undian (`/admin/draw-history`)
- Menampilkan daftar kronologis setiap undian yang terjadi: ID Undian, Waktu Pelaksanaan, Nama Hadiah Terpilih, ID Sesi Pengguna, dan Status.
- Fitur filter berdasarkan nama hadiah, tanggal, atau status undian.
- Fitur *Reset Riwayat Undian* khusus untuk pengujian pra-acara (dilengkapi konfirmasi keamanan berlapis).
- Kemampuan ekspor data ke format CSV/Excel untuk kebutuhan pelaporan panitia acara.

#### FR-07: Pengaturan Acara & Dasbor Utama (`/admin`, `/admin/settings`)
- **Statistik Dasbor**:
  - Total Undian Berhasil.
  - Sisa Kuota Undian Global.
  - Jumlah Hadiah Aktif vs Habis.
  - Persentase Penggunaan Kuota.
- **Pengaturan Global**:
  - Judul Acara (`eventName`) dan Subjudul (`eventSubtitle`).
  - Toggle Switch Status Undian (`isDrawActive`: Aktif / Nonaktif).
  - Batas Maksimum Total Undian Global (`maxTotalDraws`).
  - Batas Maksimum Undian per Sesi Pengunjung (`maxDrawsPerSession`).
  - Tombol darurat *Kill Switch* untuk menghentikan undian secara instan bila terjadi kendala lapangan.

---

### 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Keamanan (Security)**:
   - Tidak ada kredensial basis data atau *secret keys* yang terekspos ke *client bundle*.
   - Proteksi Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), dan injeksi SQL via Prisma ORM parameterized queries.
   - Pengamanan penuh terhadap kecurangan hasil undian (*zero-trust client*).
2. **Kinerja & Responsivitas (Performance)**:
   - *Time to Interactive* (TTI) halaman `/wheel` di bawah 1.5 detik pada koneksi standar 4G.
   - Waktu respons API `/api/draw/spin` di bawah 250ms pada beban konkurensi wajar.
   - Animasi roda berjalan pada minimal 60 FPS menggunakan akselerasi grafis perangkat (*requestAnimationFrame*).
3. **Keandalan & Integritas Data (Reliability)**:
   - *Zero Overselling Guarantee*: Stok hadiah tidak boleh bernilai negatif dalam kondisi lonjakan klik (*burst traffic*).
   - Penanganan transaksi database yang membatalkan seluruh operasi (*rollback*) jika salah satu langkah gagal.
4. **Usabilitas (UX/UI)**:
   - Tampilan responsif *mobile-first* dan optimal untuk layar proyektor panggung (*stage display*).
   - Palet warna cerah, kontras tinggi, dan tata letak intuitif.

---

### 5. Matriks Aturan Bisnis (Business Rules Matrix)

| Kode | Aturan Bisnis | Konsekuensi Sistem |
| :--- | :--- | :--- |
| **BR-01** | Hanya hadiah aktif dengan stok > 0 yang masuk ke roda. | Sistem memfilter `isActive = true AND stock > 0`. Jika stok habis menjadi 0, hadiah otomatis hilang dari roda pada *refresh/fetch* berikutnya. |
| **BR-02** | Semua hadiah aktif memiliki probabilitas setara secara *default*. | Peluang terpilih untuk setiap hadiah adalah `1 / N`, di mana `N` adalah jumlah hadiah aktif bersisa stok > 0. |
| **BR-03** | Server memegang kendali penuh atas penentuan pemenang. | Client hanya mengirimkan `spin request`. Server mengembalikan `prizeId` dan token hasil. Client tidak dapat memanipulasi pemenang dari DevTools. |
| **BR-04** | Undian hanya dapat diputar jika `isDrawActive == true`. | Jika admin mematikan saklar undian, tombol spin di client dinonaktifkan dan API `/api/draw/spin` mengembalikan HTTP 403 Forbidden. |
| **BR-05** | Total undian berhenti ketika mencapai batas `maxTotalDraws`. | Jika `totalDraws >= maxTotalDraws`, status undian ditutup otomatis dan pesan kuota habis ditampilkan. |
| **BR-06** | Setiap sesi browser dibatasi oleh `maxDrawsPerSession`. | Cookie sesi melacak jumlah spin per perangkat. Jika kuota sesi habis, pengguna menerima notifikasi peringatan. |
| **BR-07** | Admin dapat memperbarui stok dan status kapan saja. | Perubahan langsung tercermin pada undian berikutnya tanpa perlu me-restart aplikasi. |

---

### 6. Kriteria Penerimaan Pengguna (Acceptance Criteria)

- [ ] Pengguna publik dapat membuka `/wheel` dan melihat roda dengan juring hadiah sesuai database.
- [ ] Pengguna publik tidak dapat memutar roda jika `isDrawActive = false` atau kuota sesi habis.
- [ ] Pengguna publik memutar roda dan mendarat presisi pada hadiah yang ditentukan server.
- [ ] Stok hadiah berkurang tepat 1 di database setiap kali putaran valid terjadi.
- [ ] Tidak terjadi *overselling* saat beberapa pengguna menekan tombol spin secara simultan pada hadiah yang tersisa 1 stok.
- [ ] Admin dapat login dengan aman dan mengelola hadiah serta konfigurasi acara.
- [ ] Admin dapat melihat riwayat setiap undian secara terperinci.
