/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { Exam } from '../../types/exam';
import { 
  ShieldAlert, 
  CheckSquare, 
  Clock, 
  HelpCircle, 
  Award, 
  Monitor, 
  Maximize2, 
  ArrowLeft, 
  Play,
  Lock,
  FileCheck
} from 'lucide-react';

interface StudentInstructionViewProps {
  exam: Exam;
  onBack: () => void;
  onStartExam: () => void;
}

export const StudentInstructionView: React.FC<StudentInstructionViewProps> = ({
  exam,
  onBack,
  onStartExam,
}) => {
  const { activeStudent } = useExam();
  const [agreed, setAgreed] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    if (!agreed) return;
    setIsStarting(true);
    onStartExam();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Ujian</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileCheck className="w-4 h-4" />
            <span>Petunjuk Pengerjaan & Pakta Integritas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {exam.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {exam.subject} · {exam.classLevel} · Tahun Ajaran {exam.academicYear}
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-[11px] text-slate-500 block">Durasi Waktu</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {exam.settings.durationMinutes} Menit
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Jumlah Soal</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {exam.questions.length} Butir
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Batas KKM</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {exam.settings.passScore} Poin
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Toleransi Peringatan</span>
              <span className="text-base font-bold text-amber-600 font-mono">
                {exam.settings.maxViolations}x Batas
              </span>
            </div>
          </div>

          {/* Student Identity Confirmation */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Konfirmasi Identitas Peserta
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Nama Siswa:</span>{' '}
                <strong className="text-slate-800">{activeStudent?.name}</strong>
              </div>
              <div>
                <span className="text-slate-400">NISN:</span>{' '}
                <strong className="text-slate-800 font-mono">{activeStudent?.nisn}</strong>
              </div>
              <div>
                <span className="text-slate-400">Kelas:</span>{' '}
                <strong className="text-slate-800">{activeStudent?.classGrade}</strong>
              </div>
            </div>
          </div>

          {/* Rules & Security Mechanics */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-700" />
              <span>Tata Tertib & Ketentuan Exam Mode (Kiosk Protection)</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg flex items-start gap-2.5">
                <Maximize2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-blue-900">1. Mode Layar Penuh Otomatis:</strong> Saat menekan tombol Mulai, browser akan beralih ke tampilan layar penuh (Fullscreen) untuk mencegah pembukaan jendela lain.
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg flex items-start gap-2.5">
                <Monitor className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-blue-900">2. Deteksi Perpindahan Layar & Tab:</strong> Dilarang berpindah tab, meminimalkan browser, membuka aplikasi lain, atau menekan tombol pintas inspect/copy-paste. Setiap perpindahan akan dicatat ke <em>Audit Log Guru</em> secara instan beserta timestamp.
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-900">3. Batas Toleransi & Ujian Ditangguhkan:</strong> Jika terdeteksi aktivitas keluar halaman sebanyak <strong>{exam.settings.maxViolations} kali</strong>, sistem akan mengunci halaman dengan status <em>Ujian Ditangguhkan</em>. Ujian hanya dapat dibuka kembali dengan verifikasi PIN oleh Pengawas Ruang.
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-start gap-2.5">
                <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900">4. Autosave & Privasi Aman:</strong> Jawaban tersimpan otomatis setiap detik ke memori aman. Jawaban Anda tidak akan dihapus saat ujian terkunci atau jaringan terganggu. Aplikasi ini tidak mengakses mikrofon, kamera, atau file pribadi perangkat Anda.
                </div>
              </div>
            </div>
          </div>

          {/* Integrity Pledge */}
          <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-800 leading-normal">
                <strong>Pakta Integritas Ujian:</strong> Saya berjanji mengerjakan ujian ini secara jujur, mandiri tanpa bantuan pihak manapun atau kecerdasan buatan, mematuhi seluruh peraturan Exam Mode, dan menerima sanksi akademik apabila melakukan kecurangan.
              </span>
            </label>
          </div>

          {/* Start CTA */}
          <div className="pt-2">
            <button
              onClick={handleStart}
              disabled={!agreed || isStarting}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
                agreed && !isStarting
                  ? 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isStarting ? 'Menyiapkan Layar Ujian...' : 'MULAI UJIAN SEKARANG (MASUK EXAM MODE)'}</span>
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              Pastikan koneksi internet stabil dan tutup seluruh tab lain sebelum memulai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
