/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { Exam, ExamSettings, Question } from '../../types/exam';
import { ImportQuestionsModal } from './ImportQuestionsModal';
import { 
  exportQuestionsToCsv, 
  exportQuestionsToJson 
} from '../../utils/exportImportUtils';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ToggleLeft, 
  ToggleRight, 
  Clock, 
  HelpCircle, 
  KeyRound, 
  ShieldAlert, 
  CheckCircle,
  Copy,
  Calendar,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  CheckCircle2
} from 'lucide-react';

export const ExamManager: React.FC = () => {
  const { exams, addExam, updateExam, deleteExam, toggleExamStatus } = useExam();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [importTargetExam, setImportTargetExam] = useState<Exam | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleImportQuestions = (newQuestions: Question[], mode: 'append' | 'replace') => {
    if (!importTargetExam) return;

    let updatedList: Question[] = [];
    if (mode === 'append') {
      updatedList = [...importTargetExam.questions, ...newQuestions];
    } else {
      updatedList = newQuestions;
    }

    const newTotal = updatedList.reduce((acc, q) => acc + q.scoreWeight, 0);

    updateExam({
      ...importTargetExam,
      questions: updatedList,
      totalPossibleScore: newTotal > 0 ? newTotal : 100,
    });

    showToast(`Berhasil mengimpor ${newQuestions.length} butir soal ke dalam "${importTargetExam.title}"!`);
  };

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [code, setCode] = useState('');
  const [classLevel, setClassLevel] = useState('Kelas X SMK');
  const [academicYear, setAcademicYear] = useState('2025/2026 Ganjil');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [passScore, setPassScore] = useState(75);
  const [maxViolations, setMaxViolations] = useState(3);
  const [examToken, setExamToken] = useState('ANBK26');
  const [teacherUnlockPin, setTeacherUnlockPin] = useState('1234');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [allowStudentViewScore, setAllowStudentViewScore] = useState(true);
  const [strictExamMode, setStrictExamMode] = useState(true);

  const handleOpenCreateModal = () => {
    setEditingExamId(null);
    setTitle('');
    setSubject('');
    setCode(`UJIAN-${Math.floor(100 + Math.random() * 900)}`);
    setDurationMinutes(60);
    setPassScore(75);
    setMaxViolations(3);
    setExamToken(`TOKEN${Math.floor(10 + Math.random() * 90)}`);
    setTeacherUnlockPin('1234');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exam: Exam) => {
    setEditingExamId(exam.id);
    setTitle(exam.title);
    setSubject(exam.subject);
    setCode(exam.code);
    setClassLevel(exam.classLevel);
    setAcademicYear(exam.academicYear);
    setDurationMinutes(exam.settings.durationMinutes);
    setPassScore(exam.settings.passScore);
    setMaxViolations(exam.settings.maxViolations);
    setExamToken(exam.settings.examToken);
    setTeacherUnlockPin(exam.settings.teacherUnlockPin);
    setShuffleQuestions(exam.settings.shuffleQuestions);
    setShuffleOptions(exam.settings.shuffleOptions);
    setAllowStudentViewScore(exam.settings.allowStudentViewScore);
    setStrictExamMode(exam.settings.strictExamMode);
    setIsModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !code.trim()) return;

    const settings: ExamSettings = {
      durationMinutes: Number(durationMinutes) || 60,
      passScore: Number(passScore) || 75,
      maxViolations: Number(maxViolations) || 3,
      shuffleQuestions,
      shuffleOptions,
      allowStudentViewScore,
      strictExamMode,
      teacherUnlockPin: teacherUnlockPin.trim() || '1234',
      scheduledStartTime: new Date().toISOString().substring(0, 16),
      scheduledEndTime: new Date(Date.now() + 86400000 * 30).toISOString().substring(0, 16),
      examToken: examToken.trim().toUpperCase() || 'TOKEN1',
      isTokenActive: true,
    };

    if (editingExamId) {
      const existing = exams.find((e) => e.id === editingExamId);
      if (existing) {
        updateExam({
          ...existing,
          title,
          subject,
          code,
          classLevel,
          academicYear,
          settings,
        });
      }
    } else {
      addExam({
        code,
        title,
        subject,
        classLevel,
        academicYear,
        status: 'active',
        totalPossibleScore: 100,
        settings,
        questions: [],
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Daftar & Pengaturan Jadwal Ujian
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola kode token, durasi pengerjaan, KKM, batas pelanggaran kiosk, serta ekspor/impor butir soal.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Ujian Baru</span>
        </button>
      </div>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map((exam) => {
          const isActive = exam.status === 'active';
          return (
            <div
              key={exam.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {exam.code}
                    </span>
                    <span className="text-xs text-slate-500">{exam.subject}</span>
                  </div>
                  <button
                    onClick={() => toggleExamStatus(exam.id)}
                    className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {isActive ? 'Aktif / Dibuka' : 'Draft / Ditutup'}
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  {exam.classLevel} · Tahun Ajaran {exam.academicYear}
                </p>

                {/* Settings details */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Durasi Ujian:</span>
                    <strong className="text-slate-800">{exam.settings.durationMinutes} Menit</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Token Masuk:</span>
                    <strong className="text-blue-800 font-mono">{exam.settings.examToken}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Batas Pelanggaran:</span>
                    <strong className="text-amber-700">{exam.settings.maxViolations}x Toleransi</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">PIN Unlock Guru:</span>
                    <strong className="text-slate-800 font-mono">{exam.settings.teacherUnlockPin}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    {exam.questions.length} Butir Soal
                  </span>
                  <span>KKM: {exam.settings.passScore}</span>
                  <span>{exam.settings.allowStudentViewScore ? 'Nilai Terbuka' : 'Nilai Ditutup'}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Dibuat {new Date(exam.createdAt).toLocaleDateString('id-ID')}
                </span>
                <div className="flex items-center gap-1">
                  {/* Quick Import Questions to this exam */}
                  <button
                    onClick={() => setImportTargetExam(exam)}
                    className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Impor Butir Soal (CSV / JSON) ke ujian ini"
                  >
                    <Upload className="w-4 h-4" />
                  </button>

                  {/* Quick Export CSV */}
                  <button
                    onClick={() => {
                      if (exam.questions.length === 0) {
                        alert('Ujian ini belum memiliki butir soal untuk diekspor.');
                        return;
                      }
                      exportQuestionsToCsv(exam);
                      showToast(`Soal "${exam.code}" berhasil diekspor ke format CSV!`);
                    }}
                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    title="Ekspor Soal ke CSV (Excel)"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>

                  {/* Quick Export JSON */}
                  <button
                    onClick={() => {
                      if (exam.questions.length === 0) {
                        alert('Ujian ini belum memiliki butir soal untuk diekspor.');
                        return;
                      }
                      exportQuestionsToJson(exam);
                      showToast(`Soal "${exam.code}" berhasil diekspor ke JSON!`);
                    }}
                    className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Ekspor Soal ke JSON"
                  >
                    <FileCode className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(exam)}
                    className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Ubah Pengaturan Ujian"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus ujian "${exam.title}" beserta sesi peserta?`)) {
                        deleteExam(exam.id);
                      }
                    }}
                    className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Ujian"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: CREATE / EDIT EXAM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 my-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingExamId ? 'Edit Konfigurasi Ujian' : 'Buat Asesmen / Ujian Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Konfigurasikan detail asesmen, parameter kiosk, durasi server, dan sistem penguncian.
            </p>

            <form onSubmit={handleSaveExam} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Ujian (Singkat)
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: PAS-INF-X"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Contoh: Matematika / Informatika"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Lengkap Asesmen
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Penilaian Sumatif Akhir Semester Ganjil 2025/2026"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tingkat Kelas
                  </label>
                  <input
                    type="text"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    placeholder="Kelas X / XI / XII"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Ajaran
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2025/2026 Ganjil"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Exam Security & Rules Parameter */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <span className="text-xs font-bold text-slate-900 block">
                  Parameter Keamanan & Ketentuan Kiosk
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Durasi (Menit)</label>
                    <input
                      type="number"
                      min={5}
                      max={240}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">KKM (Nilai Lulus)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={passScore}
                      onChange={(e) => setPassScore(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Batas Pelanggaran</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={maxViolations}
                      onChange={(e) => setMaxViolations(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 font-mono text-amber-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">PIN Buka Guru</label>
                    <input
                      type="text"
                      value={teacherUnlockPin}
                      onChange={(e) => setTeacherUnlockPin(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Token Masuk Ujian (Diberikan ke Siswa)
                    </label>
                    <input
                      type="text"
                      value={examToken}
                      onChange={(e) => setExamToken(e.target.value.toUpperCase())}
                      className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 font-mono uppercase font-bold text-blue-800"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={allowStudentViewScore}
                        onChange={(e) => setAllowStudentViewScore(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Izinkan Siswa Melihat Nilai Setelah Selesai</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={strictExamMode}
                      onChange={(e) => setStrictExamMode(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Wajib Fullscreen & Deteksi Blur/Tab</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffleOptions}
                      onChange={(e) => setShuffleOptions(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Acak Urutan Pilihan Ganda</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT QUESTIONS DIRECTLY */}
      {importTargetExam && (
        <ImportQuestionsModal
          exam={importTargetExam}
          onImport={handleImportQuestions}
          onClose={() => setImportTargetExam(null)}
        />
      )}
    </div>
  );
};
