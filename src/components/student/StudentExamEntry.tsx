/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { Exam } from '../../types/exam';
import { 
  KeyRound, 
  Clock, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface StudentExamEntryProps {
  onSelectExam: (exam: Exam) => void;
}

export const StudentExamEntry: React.FC<StudentExamEntryProps> = ({ onSelectExam }) => {
  const { exams, activeStudent, findExamByToken } = useExam();
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');

  const activeExams = exams.filter((e) => e.status === 'active');

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError('');

    if (!tokenInput.trim()) {
      setTokenError('Masukkan kode atau token ujian yang diberikan pengawas!');
      return;
    }

    const found = findExamByToken(tokenInput);
    if (!found) {
      setTokenError('Token ujian tidak valid atau jadwal ujian belum dimulai!');
      return;
    }

    onSelectExam(found);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Student Welcome Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Portal Asesmen Siswa
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Selamat Datang, {activeStudent?.name}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>NISN: {activeStudent?.nisn}</span>
            <span aria-hidden="true">·</span>
            <span>{activeStudent?.classGrade}</span>
            <span aria-hidden="true">·</span>
            <span>{activeStudent?.school}</span>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-xs text-slate-400">Status Akun</div>
          <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Terotentikasi Siap Ujian
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Token Input Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Masukkan Token
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Mintalah token/PIN ujian resmi kepada pengawas ruang untuk membuka soal asesmen.
            </p>

            {tokenError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{tokenError}</span>
              </div>
            )}

            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  KODE / TOKEN UJIAN
                </label>
                <input
                  type="text"
                  placeholder="Contoh: KASTURI26"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 text-base tracking-widest font-mono font-bold text-center uppercase rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Buka Lembar Soal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              Token contoh aktif: <code className="font-mono text-slate-600 font-bold">KASTURI26</code> atau <code className="font-mono text-slate-600 font-bold">MATEMATIKA</code>
            </div>
          </div>
        </div>

        {/* Available Exams List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Daftar Ujian Aktif Hari Ini
              </h3>
              <span className="text-xs text-slate-500">
                {activeExams.length} Asesmen Tersedia
              </span>
            </div>

            {activeExams.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Belum ada jadwal asesmen yang diaktifkan oleh guru pengampu.
              </div>
            ) : (
              <div className="space-y-3">
                {activeExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-700 font-mono">
                          {exam.code}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">{exam.subject}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {exam.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {exam.settings.durationMinutes} Menit
                        </span>
                        <span className="flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                          {exam.questions.length} Butir Soal
                        </span>
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Toleransi: {exam.settings.maxViolations}x
                        </span>
                      </div>
                    </div>

                    <div className="sm:self-center shrink-0">
                      <button
                        onClick={() => onSelectExam(exam)}
                        className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Pilih Ujian</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
