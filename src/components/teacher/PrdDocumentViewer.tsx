/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Layers, 
  ShieldAlert, 
  Clock, 
  Award, 
  HelpCircle,
  Copy,
  BookOpen,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { triggerFileDownload } from '../../utils/exportImportUtils';

export const PrdDocumentViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleDownloadPrdMarkdown = async () => {
    try {
      const response = await fetch('/PRD.md');
      let text = '';
      if (response.ok) {
        text = await response.text();
      }
      if (!text) {
        text = `# Product Requirement Document (PRD)\n## Kasturi Asesmen Digital\nSilakan cek file PRD.md di root project.`;
      }
      triggerFileDownload(text, 'PRD_Kasturi_Asesmen_Digital.md', 'text/markdown;charset=utf-8');
    } catch {
      alert('File PRD.md dapat diakses langsung pada direktori utama proyek.');
    }
  };

  const handleCopySummary = () => {
    const summary = `Kasturi Asesmen Digital - PRD v1.0.0
Platform CBT & Asesmen Digital dengan Exam Mode Kiosk, Deteksi Pelanggaran (Visibility & Fullscreen API), Autosave Persisten, Bank Soal 4 Tipe (PG, Benar/Salah, Isian, Uraian), Import/Export CSV & JSON, serta Berita Acara Resmi.`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
            <BookOpen className="w-4 h-4" />
            <span>Dokumentasi Arsitektur & Spesifikasi Rekayasa</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Product Requirement Document (PRD)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Panduan lengkap pengembangan, batasan keamanan, arsitektur data, dan roadmap fitur untuk pengembang & stakeholder.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Ringkasan PRD'}</span>
          </button>

          <button
            onClick={handleDownloadPrdMarkdown}
            className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh PRD.md Lengkap</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Product Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wide">
            <ShieldAlert className="w-4 h-4" />
            <span>1. Keamanan & Kiosk Engine</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Fullscreen API, Page Visibility API (deteksi perpindahan tab), Window Blur/Focus, blokir inspect elemen (F12, Ctrl+Shift+I), dan suspensi otomatis setelah pelanggaran ke-3.
          </p>
          <div className="pt-2 text-[11px] text-slate-400 font-mono">
            Modul: <code>src/hooks/useExamSecurity.ts</code>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wide">
            <Clock className="w-4 h-4" />
            <span>2. Autosave & Sesi Persisten</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Setiap jawaban disimpan detik itu juga ke LocalStorage. Timer disinkronkan dengan server time, dan lembar jawaban otomatis dikirim saat waktu habis tanpa resiko hilang.
          </p>
          <div className="pt-2 text-[11px] text-slate-400 font-mono">
            Modul: <code>src/context/ExamContext.tsx</code>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wide">
            <Layers className="w-4 h-4" />
            <span>3. Interoperabilitas Guru</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dukungan 4 format soal (PG, Benar/Salah, Isian, Esai), Impor/Ekspor CSV & JSON, koreksi esai manual berbasis rubrik, serta cetak Berita Acara resmi sekolah (Ctrl+P).
          </p>
          <div className="pt-2 text-[11px] text-slate-400 font-mono">
            Modul: <code>src/utils/exportImportUtils.ts</code>
          </div>
        </div>
      </div>

      {/* Structured PRD Sections Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Daftar Bab & Spesifikasi Teknis pada <code>/PRD.md</code>
          </h3>
          <p className="text-xs text-slate-500">
            Berikut ringkasan bab yang telah disusun untuk mempermudah developer baru dan kontributor tim teknis:
          </p>
        </div>

        <div className="divide-y divide-slate-100 text-xs text-slate-700 space-y-4 pt-1">
          <div className="pt-3">
            <strong className="text-slate-900 block text-sm font-semibold mb-1">
              Bab 1: Executive Summary & Visi Produk
            </strong>
            <p className="text-slate-600 leading-relaxed">
              Latar belakang pembuatan CBT nasional dengan integritas tinggi, kenyamanan pengerjaan pada berbagai ukuran layar, dan kepatuhan privasi (tanpa perekaman video/audio tanpa izin).
            </p>
          </div>

          <div className="pt-4">
            <strong className="text-slate-900 block text-sm font-semibold mb-1">
              Bab 2: User Persona & User Journey
            </strong>
            <p className="text-slate-600 leading-relaxed">
              Kebutuhan Guru (penjadwalan, input token, bank soal, audit kecurangan, cetak Berita Acara) serta kebutuhan Peserta Didik (login mudah, antarmuka soal bersih, autosave transparan, bukti selesai digital).
            </p>
          </div>

          <div className="pt-4">
            <strong className="text-slate-900 block text-sm font-semibold mb-1">
              Bab 3: Spesifikasi Fungsional Fitur
            </strong>
            <ul className="list-disc list-inside space-y-1 text-slate-600 mt-1">
              <li>Role-based access (Siswa & Guru)</li>
              <li>Exam Mode Sandbox (Grace period 2000ms, event debouncing 1200ms, suspend modal, PIN unlock guru)</li>
              <li>Lembar CBT (Navigasi kisi nomor soal, font resize A/A+/A++, flag ragu-ragu)</li>
              <li>Instrumen 4 Tipe Soal (PG, Benar/Salah, Isian Singkat, Uraian/Esai)</li>
              <li>Ekspor & Impor (RFC 4180 CSV dengan UTF-8 BOM, file JSON)</li>
              <li>Dokumen resmi siap cetak (Kop Dinas, tabel rekap, tanda tangan Kepala Sekolah)</li>
            </ul>
          </div>

          <div className="pt-4">
            <strong className="text-slate-900 block text-sm font-semibold mb-1">
              Bab 4 & 5: Arsitektur Berkas & Skema Data
            </strong>
            <p className="text-slate-600 leading-relaxed">
              Daftar direktori proyek terstruktur beserta tipe TypeScript lengkap (<code>Exam</code>, <code>ExamSettings</code>, <code>Question</code>, <code>ExamSession</code>, <code>ViolationLog</code>).
            </p>
          </div>

          <div className="pt-4">
            <strong className="text-slate-900 block text-sm font-semibold mb-1">
              Bab 6 & 7: Batasan Keamanan Peramban & Roadmap Fase 2
            </strong>
            <p className="text-slate-600 leading-relaxed">
              Panduan integrasi Safe Exam Browser (SEB) / Chromebook Kiosk untuk penguncian tingkat perangkat keras, serta rencana dukungan LaTeX, audio listening, dan sinkronisasi Cloud PostgreSQL.
            </p>
          </div>
        </div>

        {/* Developer Quick-Start Note */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
          <Terminal className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600">
            <strong className="text-slate-900 block font-semibold mb-0.5">
              Lokasi File PRD di Proyek:
            </strong>
            Berkas dapat diedit atau dibaca langsung pada path root <code>/PRD.md</code>. Seluruh developer baru dapat merujuk ke dokumen tersebut sebelum menambahkan fitur atau modul baru.
          </div>
        </div>
      </div>
    </div>
  );
};
