/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useExam } from '../../context/ExamContext';
import { Exam } from '../../types/exam';
import { 
  CheckCircle, 
  Award, 
  Clock, 
  FileCheck, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  LogOut,
  QrCode
} from 'lucide-react';

interface StudentFinishedScreenProps {
  exam: Exam;
  onHome: () => void;
}

export const StudentFinishedScreen: React.FC<StudentFinishedScreenProps> = ({
  exam,
  onHome,
}) => {
  const { currentSession, activeStudent, logout } = useExam();

  const formattedSubmitTime = currentSession?.submittedAt
    ? new Date(currentSession.submittedAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '-';

  const formattedDate = currentSession?.submittedAt
    ? new Date(currentSession.submittedAt).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-';

  const durationMinutes = currentSession?.durationSecondsSpent
    ? Math.round(currentSession.durationSecondsSpent / 60)
    : 0;

  const showScore = exam.settings.allowStudentViewScore;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Success Header */}
        <div className="bg-emerald-700 text-white p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-10 h-10 text-emerald-100" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Ujian Berhasil Dikirim!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
            Lembar jawaban Anda telah diterima server dan terenkripsi aman.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Official Submission Slip */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bukti Tanda Terima Asesmen Digital
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ID: {currentSession?.id.substring(0, 16)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Nama Peserta:</span>
                <strong className="text-slate-800">{activeStudent?.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">NISN:</span>
                <strong className="text-slate-800 font-mono">{activeStudent?.nisn}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Mata Pelajaran:</span>
                <strong className="text-slate-800">{exam.subject}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Judul Asesmen:</span>
                <strong className="text-slate-800 truncate block">{exam.title}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Waktu Pengumpulan:</span>
                <strong className="text-slate-800">{formattedDate}, {formattedSubmitTime} WIB</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Lama Pengerjaan:</span>
                <strong className="text-slate-800">{durationMinutes} Menit</strong>
              </div>
            </div>

            {/* Score Showcase if allowed */}
            {showScore && currentSession?.totalScore !== undefined && (
              <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between bg-white p-4 rounded-lg border">
                <div>
                  <span className="text-xs text-slate-500 block">Skor Akhir Sementara:</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-bold text-blue-900 font-mono">
                      {currentSession.totalScore}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Status KKM ({exam.settings.passScore}):</span>
                  <span
                    className={`inline-block mt-1 text-xs font-bold px-2.5 py-1 rounded ${
                      currentSession.isPassed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {currentSession.isPassed ? 'Tuntas KKM' : 'Perlu Remedial'}
                  </span>
                </div>
              </div>
            )}

            {!showScore && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                Nilai dan umpan balik ujian akan diumumkan oleh guru setelah proses rekapitulasi dan koreksi uraian selesai.
              </div>
            )}

            {/* Security Audit Badge */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                Terverifikasi Integritas Kiosk Mode
              </span>
              <span>Pelanggaran: {currentSession?.violationCount || 0}x</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onHome}
              className="w-full sm:flex-1 py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>Kembali ke Beranda Ujian</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="w-full sm:w-auto py-3 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
