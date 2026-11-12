/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useExam } from '../../context/ExamContext';
import { ExamSession, Exam } from '../../types/exam';
import { 
  exportResultsToCsv, 
  exportResultsToJson, 
  exportAuditLogsToCsv 
} from '../../utils/exportImportUtils';
import { 
  Award, 
  Clock, 
  ShieldAlert, 
  Printer, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  FileCheck2,
  TrendingUp,
  Users,
  Search,
  Download,
  FileSpreadsheet,
  FileCode,
  Shield
} from 'lucide-react';

interface ResultsAndStatsProps {
  onOpenEssayGrading: (session: ExamSession) => void;
  onPrintReport: (exam: Exam, sessions: ExamSession[]) => void;
}

export const ResultsAndStats: React.FC<ResultsAndStatsProps> = ({
  onOpenEssayGrading,
  onPrintReport,
}) => {
  const { exams, sessions, deleteSession } = useExam();
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  const handleExportResultsCsv = () => {
    if (!currentExam) return;
    if (relevantSessions.length === 0) {
      alert('Belum ada data hasil pengerjaan peserta untuk diekspor pada ujian ini.');
      return;
    }
    exportResultsToCsv(currentExam, relevantSessions);
    showToast(`Rekap nilai "${currentExam.code}" berhasil diekspor ke format CSV!`);
  };

  const handleExportResultsJson = () => {
    if (!currentExam) return;
    if (relevantSessions.length === 0) {
      alert('Belum ada data hasil pengerjaan peserta untuk diekspor pada ujian ini.');
      return;
    }
    exportResultsToJson(currentExam, relevantSessions);
    showToast(`Arsip hasil asesmen "${currentExam.code}" berhasil diekspor ke JSON!`);
  };

  const handleExportAuditLogsCsv = () => {
    if (!currentExam) return;
    exportAuditLogsToCsv(currentExam, relevantSessions);
    showToast(`Audit log pelanggaran "${currentExam.code}" berhasil diekspor ke CSV!`);
  };

  const relevantSessions = useMemo(() => {
    if (!currentExam) return [];
    return sessions.filter((s) => s.examId === currentExam.id);
  }, [sessions, currentExam]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return relevantSessions;
    const q = searchQuery.toLowerCase();
    return relevantSessions.filter(
      (s) =>
        s.student.name.toLowerCase().includes(q) ||
        s.student.nisn.includes(q) ||
        s.student.classGrade.toLowerCase().includes(q)
    );
  }, [relevantSessions, searchQuery]);

  // Quantitative Rigor / Stats
  const stats = useMemo(() => {
    const completed = relevantSessions.filter((s) => s.isCompleted);
    if (completed.length === 0) {
      return {
        totalParticipants: relevantSessions.length,
        completedCount: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passCount: 0,
        passRate: 0,
      };
    }

    const scores = completed
      .map((s) => s.totalScore ?? 0)
      .filter((sc) => typeof sc === 'number');

    const total = scores.reduce((a, b) => a + b, 0);
    const avg = scores.length > 0 ? Math.round(total / scores.length) : 0;
    const high = scores.length > 0 ? Math.max(...scores) : 0;
    const low = scores.length > 0 ? Math.min(...scores) : 0;
    const pass = completed.filter((s) => s.isPassed).length;
    const passRate = Math.round((pass / completed.length) * 100);

    return {
      totalParticipants: relevantSessions.length,
      completedCount: completed.length,
      averageScore: avg,
      highestScore: high,
      lowestScore: low,
      passCount: pass,
      passRate,
    };
  }, [relevantSessions]);

  if (!currentExam) {
    return <div className="p-6 text-slate-500 text-sm">Belum ada data asesmen.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Filter & Export & Print bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Pilih Asesmen:
          </label>
          <select
            value={currentExam.id}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.code} - {ex.title}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons: Export CSV, Export JSON, Export Audit, Print */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export Results to CSV (Excel) */}
          <button
            onClick={handleExportResultsCsv}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Ekspor seluruh rekap nilai siswa ke format CSV Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ekspor CSV Nilai</span>
          </button>

          {/* Export Results to JSON */}
          <button
            onClick={handleExportResultsJson}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Ekspor arsip lengkap hasil pengerjaan ke JSON"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-700" />
            <span>Ekspor JSON</span>
          </button>

          {/* Export Audit Log to CSV */}
          <button
            onClick={handleExportAuditLogsCsv}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ekspor timeline pelanggaran integritas kiosk ke CSV"
          >
            <Shield className="w-3.5 h-3.5 text-slate-600" />
            <span>Log CSV</span>
          </button>

          {/* Official Print */}
          <button
            onClick={() => onPrintReport(currentExam, relevantSessions)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Berita Acara</span>
          </button>
        </div>
      </div>

      {/* Quantitative Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Total Peserta Ujian</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            {stats.totalParticipants} <span className="text-xs font-normal text-slate-400">Siswa</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {stats.completedCount} selesai dikumpulkan
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Rata-rata Nilai Kelas</span>
          <div className="text-2xl font-bold text-blue-700 font-mono mt-1 tabular-nums">
            {stats.averageScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            KKM Target: {currentExam.settings.passScore}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Rentang Nilai Tertinggi & Terendah</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            {stats.highestScore} <span className="text-xs font-normal text-slate-400">/</span> {stats.lowestScore}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Maks: {stats.highestScore} · Min: {stats.lowestScore}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">Tingkat Kelulusan KKM</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-1 tabular-nums">
            {stats.passRate}%
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            {stats.passCount} dari {stats.completedCount} siswa tuntas
          </span>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Daftar Peserta & Lembar Hasil Ujian
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik "Koreksi Uraian" untuk memberikan nilai manual pada butir esai siswa.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Siswa / NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Status Pengerjaan</th>
                <th className="py-3 px-4 text-center">Durasi</th>
                <th className="py-3 px-4 text-center">Pelanggaran</th>
                <th className="py-3 px-4 text-center">Nilai Total</th>
                <th className="py-3 px-4 text-center">Hasil KKM</th>
                <th className="py-3 px-4 text-right">Aksi Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                    Belum ada siswa yang mengerjakan asesmen ini.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const minutes = Math.round(session.durationSecondsSpent / 60);
                  const hasEssay = currentExam.questions.some((q) => q.type === 'uraian');

                  return (
                    <tr key={session.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{session.student.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          NISN: {session.student.nisn}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{session.student.classGrade}</td>
                      <td className="py-3.5 px-4">
                        {session.isSuspended ? (
                          <span className="text-red-700 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                            Ditangguhkan
                          </span>
                        ) : session.isCompleted ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                            Selesai Dikirim
                          </span>
                        ) : (
                          <span className="text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                            Sedang Mengerjakan
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono tabular-nums text-slate-700">
                        {session.isCompleted ? `${minutes}m` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono tabular-nums">
                        <span
                          className={`font-bold ${
                            session.violationCount > 0 ? 'text-amber-700' : 'text-slate-400'
                          }`}
                        >
                          {session.violationCount}x
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-900 font-mono text-sm tabular-nums">
                          {session.totalScore !== undefined ? session.totalScore : '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {session.totalScore !== undefined ? (
                          <span
                            className={`font-semibold text-[11px] px-2 py-0.5 rounded ${
                              session.isPassed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {session.isPassed ? 'Tuntas' : 'Remedial'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasEssay && session.isCompleted && (
                            <button
                              onClick={() => onOpenEssayGrading(session)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                            >
                              Koreksi Uraian
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus sesi pengerjaan siswa ${session.student.name}?`)) {
                                deleteSession(session.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Hapus Sesi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
