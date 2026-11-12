/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldCheck, 
  Monitor, 
  HelpCircle, 
  Clock, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  School,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

interface LandingHeroProps {
  onLoginClick: (role?: 'siswa' | 'guru') => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onLoginClick }) => {
  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 lg:p-16 shadow-xs relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-900 mb-6">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Sistem Asesmen Berbasis Komputer & Kiosk Aman</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15] mb-6 text-balance">
              Ulangan & Asesmen Digital Modern dengan Proteksi Integritas Kiosk.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
              Platform asesmen sekolah berbasis web yang dirancang untuk kemudahan guru dan fokus belajar siswa. Dilengkapi deteksi perpindahan layar real-time, autosave jawaban terenkripsi, 4 format bank soal, serta berita acara ujian standar resmi.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onLoginClick('siswa')}
                className="px-6 py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Masuk Ujian Siswa (Pakai Token)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onLoginClick('guru')}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Portal Pengawas / Guru</span>
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Page Visibility API & Blur Detection
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Autosave Jawaban Tak Pernah Hilang
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Tanpa Akses Kamera / Privasi Terjaga
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Architecture Pillars */}
      <section id="fitur" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
            Fitur Utama Sistem
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Dibangun untuk Keamanan, Kemudahan, dan Keadilan Akademik
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Monitor className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Exam Kiosk Mode
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Layar penuh otomatis saat ujian dimulai, mendeteksi perpindahan tab, jendela blur, pemotongan pintasan F12/Ctrl+C, serta penguncian ujian otomatis saat melewati batas pelanggaran.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Autosave & Server Timer
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Penyimpanan berkala otomatis di setiap butir soal. Jika browser ditutup atau koneksi putus, jawaban pulih seketika saat masuk kembali tanpa kehilangan progres.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              4 Format Bank Soal
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mendukung Pilihan Ganda (opsi A–E), Benar/Salah interaktif, Isian Singkat toleran, dan Uraian/Esai dilengkapi rubrik penskoran dan ruang koreksi guru.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Audit Log & Berita Acara
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Catatan audit log detik demi detik setiap aktivitas siswa, analitik ketuntasan KKM, serta cetak Berita Acara Pelaksanaan Asesmen standar sekolah Indonesia.
            </p>
          </div>
        </div>
      </section>

      {/* Step by Step Workflow */}
      <section id="alur" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">
              Alur Pelaksanaan Ujian
            </span>
            <h2 className="text-2xl font-bold tracking-tight mt-1">
              Alur Sederhana & Terstandarisasi
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Dari otentikasi login, token ujian, mode layar penuh, hingga penerbitan bukti selesai digital.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
            {[
              { step: '01', title: 'Login Akun', desc: 'NISN / NIP' },
              { step: '02', title: 'Kode Ujian', desc: 'Input Token' },
              { step: '03', title: 'Instruksi', desc: 'Pakta Integritas' },
              { step: '04', title: 'Mulai Ujian', desc: 'Fullscreen Kiosk' },
              { step: '05', title: 'Lembar Soal', desc: 'Navigasi & Jawab' },
              { step: '06', title: 'Timer Sinkron', desc: 'Autosave Aktif' },
              { step: '07', title: 'Konfirmasi', desc: 'Review Jawaban' },
              { step: '08', title: 'Selesai', desc: 'Tanda Terima' },
            ].map((st, i) => (
              <div key={st.step} className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[11px] font-mono text-blue-400 font-bold block mb-1">
                  {st.step}
                </span>
                <span className="text-xs font-bold block text-white">{st.title}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{st.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
