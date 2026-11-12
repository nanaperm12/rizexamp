# Product Requirement Document (PRD)
## Kasturi Asesmen Digital (CBT & Digital Assessment Platform)

**Versi Dokumen:** 1.0.0  
**Status:** Active / Production-Ready  
**Tanggal:** 12 November 2026  
**Target Pengguna:** Guru / Pengawas Sekolah, Peserta Didik (Siswa SD/SMP/SMA/SMK), dan Administrator IT Asesmen Sekolah.

---

## 1. Executive Summary & Visi Produk

**Kasturi Asesmen Digital** adalah platform aplikasi ulangan dan asesmen berbasis komputer (Computer-Based Test / CBT) modern yang dirancang khusus untuk memenuhi standar asesmen pendidikan di Indonesia (misal: ANBK, PAS, PTS, Penilaian Sumatif Kurikulum Merdeka).

Aplikasi berfokus pada:
1. **Integritas & Keamanan Kiosk (Exam Mode)**: Meminimalisasi kecurangan melalui deteksi perpindahan tab, kehilangan fokus jendela, dan keluarnya mode layar penuh tanpa melanggar privasi pengguna (tanpa kamera/mikrofon wajib).
2. **Keandalan Data (Autosave & Server-Time Synchronization)**: Pencegahan hilangnya jawaban akibat listrik padam atau koneksi internet terputus.
3. **Fleksibilitas Pedagogik**: Mendukung 4 jenis instrumen soal (Pilihan Ganda, Benar/Salah, Isian Singkat, dan Uraian/Esai).
4. **Interoperabilitas Guru**: Kemudahan manajemen bank soal (Impor/Ekspor CSV & JSON), koreksi esai berbasis rubrik, cetak Berita Acara resmi, dan ekspor rekapitulasi nilai.

---

## 2. Persona Pengguna

### 2.1. Guru / Pengawas Ruangan
- **Tujuan**: Membuat paket ujian, mengatur jadwal dan token, memantau integritas siswa saat ujian berlangsung, mengoreksi butir esai, dan mencetak laporan resmi.
- **Kebutuhan**:
  - Pengaturan token ujian dan PIN pengawas pembuka suspensi.
  - Fitur ekspor/impor soal menggunakan format spreadsheet (CSV/Excel) agar tidak perlu mengetik satu-satu.
  - Audit log real-time untuk melihat siswa mana yang mencoba membuka tab baru.
  - Rekapitulasi nilai otomatis sesuai KKM / KKTP.

### 2.2. Siswa (Peserta Ujian)
- **Tujuan**: Mengerjakan ulangan dengan tenang, fokus, dan tanpa kendala teknis.
- **Kebutuhan**:
  - Antarmuka lembar soal yang bersih, responsif di HP/tablet/laptop, dan ukuran huruf yang dapat disesuaikan.
  - Status tersimpan (*autosave*) yang jelas sehingga tidak panik saat terjadi kendala jaringan.
  - Peringatan yang adil sebelum ujian dikunci jika tidak sengaja keluar layar penuh.
  - Bukti tanda terima asesmen resmi setelah selesai mengumpulkan.

---

## 3. Fitur Utama & Spesifikasi Fungsional

### 3.1. Autentikasi & Manajemen Sesi (Role-Based Access)
- **Role Siswa**:
  - Masuk melalui NISN, Nama Lengkap, dan Kelas, atau memilih akun cepat (*preset account*) untuk pengujian.
  - Token Ujian (Case-Insensitive): Validasi terhadap jadwal aktif dan status token ujian.
- **Role Guru / Pengawas**:
  - Masuk dengan NIP/Email kedinasan dan kata sandi.
  - Akses penuh ke dashboard analitik, bank soal, pengaturan jadwal, audit log, dan cetak dokumen.

### 3.2. Exam Mode & Kiosk Protection Engine
Sistem pengawasan integritas berbasis peramban (*web-based anti-cheat sandbox*):
- **Fullscreen Enforcement**: Meminta izin layar penuh saat siswa menekan tombol "Mulai Ujian". Pelepasan fullscreen dicatat sebagai pelanggaran (`FULLSCREEN_EXIT`).
- **Page Visibility API (`document.hidden`)**: Mendeteksi seketika saat tab diminimalkan atau siswa beralih ke tab peramban lain (`TAB_SWITCH`).
- **Window Blur Detection**: Mendeteksi saat jendela ujian kehilangan fokus ke aplikasi luar seperti Discord, Telegram, kalkulator, atau split-window (`WINDOW_BLUR`).
- **Shortcut & Context Menu Interception**:
  - Blokir tombol pintas Developer Tools (F12, Ctrl+Shift+I, Ctrl+U).
  - Blokir pintasan salin/tempel (Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A).
  - Blokir refresh halaman yang tidak disengaja (F5, Ctrl+R).
  - Blokir klik kanan (*context menu*).
- **Grace Period & Debouncing**:
  - Jeda toleransi 2000ms pada awal pembukaan ujian untuk mencegah *false-positive* saat animasi peramban beralih ke fullscreen.
  - Pembatasan pencatatan log maksimal 1 per 1200ms untuk mencegah log spamming.
- **Mekanisme Peringatan & Suspensi**:
  - Pelanggaran ke-1 sampai ke-(N-1): Menampilkan modal peringatan *"Terdeteksi aktivitas meninggalkan halaman ujian. Silakan kembali ke ujian"*.
  - Melewati Batas Toleransi (Default: 3x): Layar ujian dikunci dengan status *"Ujian Ditangguhkan"*. Jawaban tetap aman tersimpan. Ujian hanya dapat dibuka kembali dengan memasukkan **PIN Guru/Pengawas** (Default: `1234`).

### 3.3. Lembar Pengerjaan Soal CBT (Student Stage)
- **Navigasi Soal**:
  - Grid matriks nomor soal dengan indikator visual: Biru (Terjawab), Kuning/Bookmark (Ragu-ragu), Abu-abu (Belum Terjawab).
  - Kontrol navigasi *Sebelumnya*, *Ragu-ragu*, *Selanjutnya*, dan *Kirim Ujian*.
- **Aksesibilitas Teks**:
  - Toggle font size instan: A (Normal), A+ (Besar), A++ (Sangat Besar).
- **Penyimpanan Berkelanjutan & Timer**:
  - Autosave otomatis ke local storage setiap kali ada perubahan jawaban (PG, Benar/Salah, Isian, atau Uraian).
  - Perhitungan sisa waktu berbasis server timestamp (mencegah manipulasi jam lokal perangkat siswa).
  - Auto-submit otomatis jika waktu pengerjaan habis (`AUTO_TIMEOUT`).

### 3.4. Bank Soal & Format Instrumen
Mendukung 4 format instrumen asesmen:
1. **Pilihan Ganda (PG)**: Pilihan opsi A sampai E, pengacakan opsi pilihan ganda (*shuffle options*), dan kunci jawaban otomatis.
2. **Benar / Salah**: Pilihan tombol biner dengan skor otomatis.
3. **Isian Singkat**: Jawaban teks eksak dengan evaluasi otomatis (*case-insensitive*).
4. **Uraian / Esai**: Input teks panjang siswa dilengkapi pedoman rubrik penilaian guru dan antarmuka penskoran manual terdedikasi.

### 3.5. Interoperabilitas: Import & Export Soal
- **Export Soal**:
  - Format `.csv` dengan UTF-8 BOM untuk kompatibilitas sempurna dengan Microsoft Excel / Google Sheets.
  - Format `.json` untuk arsip digital dan transfer paket soal antar-server.
- **Import Soal**:
  - Drag-and-drop file CSV atau JSON.
  - Parser cerdas yang memvalidasi tipe soal, opsi, dan kunci jawaban.
  - Pilihan mode: **Tambahkan (Append)** atau **Ganti Seluruhnya (Replace)**.
  - Fitur unduh template CSV (*ready-to-use template*).

### 3.6. Hasil Ujian, Rekapitulasi & Dokumen Resmi
- **Export Hasil Ujian**:
  - Format `.csv` memuat identitas peserta, durasi pengerjaan, skor total, status KKM (Tuntas/Remedial), rincian jawaban per nomor, dan status koreksi esai.
  - Format `.json` untuk seluruh data sesi.
- **Export Audit Log**:
  - Format `.csv` berisi log detik demi detik setiap insiden perpindahan tab atau fokus.
- **Berita Acara Resmi Sekolah**:
  - Template cetak langsung (Ctrl+P / Printer Friendly) dengan kop resmi sekolah, nomor surat, rekapitulasi ketuntasan, dan kolom tanda tangan Kepala Sekolah serta Guru Pengampu.

---

## 4. Arsitektur Teknis & Struktur Proyek

### 4.1. Tech Stack
- **Framework**: React 19 (TypeScript)
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations & Interaction**: Motion (Framer Motion)
- **Font**: Plus Jakarta Sans & JetBrains Mono (Google Fonts)

### 4.2. Struktur Berkas (File Structure)
```
/
├── .env.example                       # Contoh environment variables
├── index.html                         # Entrypoint HTML & fonts
├── metadata.json                      # Metadata AI Studio
├── package.json                       # Dependensi dan build script
├── PRD.md                             # Dokumen Kebutuhan Produk (PRD)
├── tsconfig.json                      # Konfigurasi TypeScript
├── vite.config.ts                     # Konfigurasi bundler Vite & alias
└── src/
    ├── main.tsx                       # React root renderer
    ├── index.css                      # Global Tailwind CSS imports
    ├── App.tsx                        # Root container & route switcher
    ├── types/
    │   └── exam.ts                    # Tipe data TypeScript (Exam, Session, Question, Log)
    ├── context/
    │   └── ExamContext.tsx            # Global state management & persistence
    ├── hooks/
    │   └── useExamSecurity.ts         # Hook deteksi tab, fullscreen, blur, shortcut
    ├── data/
    │   └── initialData.ts             # Paket soal bawaan & akun guru/siswa
    ├── utils/
    │   └── exportImportUtils.ts       # Utility parser & generator CSV/JSON
    └── components/
        ├── auth/
        │   └── LoginView.tsx          # Portal login siswa & guru
        ├── common/
        │   └── DeviceSecurityNotice.tsx # Banner penjelasan standar kiosk browser vs hardware
        ├── home/
        │   └── LandingHero.tsx        # Halaman depan & penjelasan alur CBT
        ├── layout/
        │   └── Navbar.tsx             # Navigasi atas dengan Zero-Pill discipline
        ├── student/
        │   ├── StudentExamEntry.tsx   # Input token ujian
        │   ├── StudentInstructionView.tsx # Tata tertib & pakta integritas
        │   ├── StudentExamScreen.tsx  # Lembar soal CBT + modal peringatan & suspensi
        │   ├── StudentFinishedScreen.tsx # Bukti tanda terima pengumpulan ujian
        │   └── StudentFlow.tsx        # Controller alur pengerjaan siswa
        └── teacher/
            ├── TeacherDashboard.tsx   # Dashboard utama pengawas & tab navigator
            ├── ExamManager.tsx        # Manajemen jadwal & konfigurasi ujian
            ├── QuestionBankManager.tsx # Manajemen bank soal (Add, Edit, Import, Export)
            ├── ResultsAndStats.tsx    # Analitik nilai, filter, export CSV/JSON
            ├── AuditLogViewer.tsx     # Riwayat investigasi kecurangan
            ├── EssayGradingModal.tsx  # Koreksi jawaban esai manual
            ├── ImportQuestionsModal.tsx # Dialog impor CSV/JSON
            └── PrintableReport.tsx    # Berita Acara resmi siap cetak
```

---

## 5. Model Data Utama (Data Schema)

### 5.1. `Exam`
```typescript
interface Exam {
  id: string;
  code: string;
  title: string;
  subject: string;
  classLevel: string;
  academicYear: string;
  questions: Question[];
  settings: ExamSettings;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  totalPossibleScore: number;
}
```

### 5.2. `ExamSettings`
```typescript
interface ExamSettings {
  durationMinutes: number;
  passScore: number;           // KKM (Kriteria Ketuntasan Minimal)
  maxViolations: number;       // Batas toleransi pelanggaran sebelum suspensi
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowStudentViewScore: boolean;
  strictExamMode: boolean;     // Menyalakan deteksi fullscreen & tab switch
  teacherUnlockPin: string;    // PIN pengawas pembuka suspensi (misal: "1234")
  scheduledStartTime: string;
  scheduledEndTime: string;
  examToken: string;           // Token masuk ujian
  isTokenActive: boolean;
}
```

### 5.3. `Question`
```typescript
interface Question {
  id: string;
  type: 'pg' | 'isian' | 'benar_salah' | 'uraian';
  text: string;
  options?: { id: string; text: string }[];
  correctAnswer: string | boolean;
  scoreWeight: number;
  rubric?: string;
  topic: string;
  explanation?: string;
}
```

### 5.4. `ExamSession`
```typescript
interface ExamSession {
  id: string;
  examId: string;
  student: StudentUser;
  startedAt: number;
  submittedAt?: number;
  durationSecondsSpent: number;
  answers: Record<string, StudentAnswerItem>;
  violations: ViolationLog[];
  violationCount: number;
  isSuspended: boolean;
  suspendedReason?: string;
  isCompleted: boolean;
  submissionType?: 'MANUAL' | 'AUTO_TIMEOUT' | 'FORCED_BY_TEACHER';
  totalScore?: number;
  isPassed?: boolean;
  isGraded: boolean;
  lastAutosavedAt?: number;
}
```

---

## 6. Standar Keamanan & Batasan Peramban (Security Boundary)

| Kategori Proteksi | Mekanisme di Aplikasi | Tingkat Efektivitas | Catatan Penting |
| :--- | :--- | :--- | :--- |
| **Tab Switching** | Page Visibility API (`visibilitychange`) | Tinggi (100% pada tab browser) | Merekam waktu keluar dan durasi. |
| **Window Minimization** | Window `blur` / `focus` event | Tinggi | Terpicu jika membuka aplikasi lain. |
| **Inspect / DevTools** | `keydown` interception (F12, Ctrl+Shift+I) | Sedang - Tinggi | Diblokir pada level peramban. |
| **Clipboard / Copy** | Blokir Ctrl+C, Ctrl+V, dan mouse select | Sedang | Mencegah pencontekan teks cepat. |
| **Perangkat Keras Kiosk** | Rekomendasi SEB / MDM / Chromebook Kiosk | Mutlak (Tingkat OS) | Browser web biasa tidak dapat mengunci tombol hardware OS (seperti Windows Key atau Ctrl+Alt+Del) karena batasan sandbox web API standar. |

---

## 7. Rencana Pengembangan Selanjutnya (Roadmap)

### Fase 1 (Selesai):
- [x] Portal login guru & siswa.
- [x] Exam Mode Kiosk (Fullscreen, Visibility API, Window Blur, Shortcut Interception).
- [x] Timer server & autosave persisten.
- [x] 4 tipe soal: Pilihan Ganda, Benar/Salah, Isian Singkat, Uraian.
- [x] Import/Export soal (CSV & JSON) dan export hasil rekapitulasi nilai.
- [x] Rubrik koreksi esai guru dan cetak Berita Acara resmi.

### Fase 2 (Pengembangan Mendatang):
- [ ] Dukungan formula matematika LaTeX / KaTeX dan simbol kimia.
- [ ] Pengunggahan gambar/audio stimulus pada soal (multimedia listening test).
- [ ] Integrasi backend server PostgreSQL (Drizzle ORM) untuk sinkronisasi multi-ruang ujian tersentralisasi.
- [ ] Integrasi konfigurasi Safe Exam Browser (`.seb` configuration file generator).
