/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { ExamManager } from './ExamManager';
import { QuestionBankManager } from './QuestionBankManager';
import { ResultsAndStats } from './ResultsAndStats';
import { AuditLogViewer } from './AuditLogViewer';
import { EssayGradingModal } from './EssayGradingModal';
import { PrintableReport } from './PrintableReport';
import { PrdDocumentViewer } from './PrdDocumentViewer';
import { ExamSession, Exam } from '../../types/exam';
import { 
  Layers, 
  HelpCircle, 
  Award, 
  ShieldAlert, 
  Lock, 
  RotateCcw,
  Sparkles,
  School,
  MonitorCheck,
  BookOpen
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { teacher, exams, sessions, resetAllData } = useExam();
  const [activeTab, setActiveTab] = useState<'exams' | 'questions' | 'results' | 'audit' | 'security' | 'prd'>('exams');
  
  // Modal states
  const [gradingSession, setGradingSession] = useState<ExamSession | null>(null);
  const [printData, setPrintData] = useState<{ exam: Exam; sessions: ExamSession[] } | null>(null);

  // If in printable report mode
  if (printData) {
    return (
      <PrintableReport
        exam={printData.exam}
        sessions={printData.sessions}
        teacher={teacher}
        onBack={() => setPrintData(null)}
      />
    );
  }

  const totalViolations = sessions.reduce((acc, s) => acc + s.violationCount, 0);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Teacher Profile & School Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
            <School className="w-4 h-4" />
            <span>{teacher.school}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Dashboard Pengawas & Asesmen Digital
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Guru: {teacher.name}</span>
            <span aria-hidden="true">·</span>
            <span>NIP: {teacher.nip}</span>
            <span aria-hidden="true">·</span>
            <span>{teacher.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('Reset seluruh data simulasi ke konfigurasi standar sekolah?')) {
                resetAllData();
              }
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Reset data lokal ke default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Default</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Total Paket Ujian</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5 tabular-nums">
            {exams.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {exams.filter((e) => e.status === 'active').length} ujian aktif
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Siswa Mengumpulkan</span>
          <div className="text-2xl font-bold text-blue-700 font-mono mt-0.5 tabular-nums">
            {sessions.filter((s) => s.isCompleted).length}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {sessions.length} total sesi
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Pelanggaran Terdeteksi</span>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-0.5 tabular-nums">
            {totalViolations}
          </div>
          <span className="text-[11px] text-amber-700/80 mt-0.5 block">
            Terekam di Audit Log
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Status Sistem Kiosk</span>
          <div className="text-base font-bold text-emerald-700 flex items-center gap-1.5 mt-1.5">
            <MonitorCheck className="w-4 h-4 text-emerald-600" />
            <span>Proteksi Aktif</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Fullscreen & Tab Lock
          </span>
        </div>
      </div>

      {/* Segmented Control Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('exams')}
          className={`py-2 px-4 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'exams'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Manajemen Ujian</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`py-2 px-4 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'questions'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Bank Soal Multi-Tipe</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`py-2 px-4 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'results'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Hasil & Rekap Nilai</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`py-2 px-4 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Audit Log Real-time</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`py-2 px-4 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Keamanan Kiosk & SEB</span>
        </button>

        <button
          onClick={() => setActiveTab('prd')}
          className={`py-2 px-4 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'prd'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>PRD Proyek</span>
        </button>
      </div>

      {/* Main Tab View */}
      {activeTab === 'exams' && <ExamManager />}
      {activeTab === 'questions' && <QuestionBankManager />}
      {activeTab === 'results' && (
        <ResultsAndStats
          onOpenEssayGrading={(session) => setGradingSession(session)}
          onPrintReport={(exam, sessList) => setPrintData({ exam, sessions: sessList })}
        />
      )}
      {activeTab === 'audit' && <AuditLogViewer />}
      {activeTab === 'prd' && <PrdDocumentViewer />}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Pedoman Keamanan & Arsitektur Exam Mode
            </h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Penjelasan teknis mekanisme keamanan berbasis web browser dan panduan penguncian tingkat perangkat (Hardware Kiosk).
            </p>

            <div className="space-y-4 text-xs leading-relaxed">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  1. Mekanisme Proteksi Berbasis Web (Browser-Level)
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                  <li><strong>HTML5 Fullscreen API:</strong> Mengunci fokus pada layar penuh dan mendeteksi pelepasan fullscreen.</li>
                  <li><strong>Page Visibility API:</strong> Memantau pergantian tab dan meminimalkan jendela seketika (<code className="bg-slate-200 px-1 py-0.5 rounded font-mono">document.hidden</code>).</li>
                  <li><strong>Window Focus/Blur Event:</strong> Menangkap aksi pembukaan aplikasi desktop lain, floating modal, atau interaksi split-screen.</li>
                  <li><strong>Keyboard Shortcut Blocking:</strong> Memblokir tombol pintas Developer Tools (F12, Ctrl+Shift+I), tombol refresh (F5), dan kombinasi salin-tempel (Ctrl+C, Ctrl+V).</li>
                  <li><strong>Context Menu Prevention:</strong> Mematikan fungsi klik kanan mouse untuk mencegah inspeksi elemen.</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <h3 className="font-bold text-blue-900 text-sm">
                  2. Ketentuan Tindakan Otomatis & Penangguhan (Suspension)
                </h3>
                <p className="text-blue-800">
                  Sesuai standar asesmen nasional, sistem memberikan kesempatan toleransi (default: 3x peringatan). Jika batas terlampaui:
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Layar siswa dibekukan dengan status <em>Ujian Ditangguhkan</em>.</li>
                  <li>Jawaban siswa <strong>tetap tersimpan 100%</strong> dan tidak dihapus.</li>
                  <li>Pengawas ruang dapat membuka kunci menggunakan <strong>PIN Guru Unlock</strong> yang telah dikonfigurasi di pengaturan ujian.</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                <h3 className="font-bold text-amber-900 text-sm">
                  3. Batasan Browser & Rekomendasi Device Kiosk (Tingkat Perangkat Keras)
                </h3>
                <p className="text-amber-800 leading-relaxed">
                  Web browser standar (Chrome/Edge/Firefox biasa) dibatasi oleh sandbox keamanan OS dan tidak dapat mengunci tombol sistem seperti tombol Windows, Ctrl+Alt+Del, atau gesture multi-touch di perangkat tertentu tanpa izin administrator OS.
                </p>
                <p className="text-amber-800 font-semibold">
                  Rekomendasi untuk Ujian Tingkat Dinas / Ujian Nasional:
                </p>
                <ul className="list-disc list-inside space-y-1 text-amber-800">
                  <li><strong>Safe Exam Browser (SEB):</strong> Mengubah komputer apa pun menjadi workstation asesmen aman.</li>
                  <li><strong>Chromebook Kiosk Mode (Google Workspace for Education):</strong> Penguncian perangkat terkelola secara sentral.</li>
                  <li><strong>Android Lock-Task Mode / MDM:</strong> Mengunci tablet Android pada satu aplikasi ujian tunggal.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Essay Grading */}
      {gradingSession && (
        <EssayGradingModal
          session={gradingSession}
          onClose={() => setGradingSession(null)}
        />
      )}
    </div>
  );
};
