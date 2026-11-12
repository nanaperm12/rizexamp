/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useExam } from '../../context/ExamContext';
import { Exam, Question } from '../../types/exam';
import { useExamSecurity } from '../../hooks/useExamSecurity';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Lock, 
  ShieldAlert, 
  Maximize, 
  Type, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface StudentExamScreenProps {
  exam: Exam;
  onFinish: () => void;
}

export const StudentExamScreen: React.FC<StudentExamScreenProps> = ({ exam, onFinish }) => {
  const { 
    currentSession, 
    updateAnswer, 
    toggleFlagQuestion, 
    unlockSessionWithPin, 
    submitExam,
    activeStudent 
  } = useExam();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xl'>('normal');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [teacherPinInput, setTeacherPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  // Exam Security Hook
  const { 
    isFullscreen, 
    requestFullscreen, 
    warningMessage, 
    clearWarningMessage 
  } = useExamSecurity({
    enabled: !!exam.settings.strictExamMode,
    isSuspended: !!currentSession?.isSuspended,
    isCompleted: !!currentSession?.isCompleted,
    maxViolations: exam.settings.maxViolations,
  });

  // Attempt initial fullscreen on mount
  useEffect(() => {
    requestFullscreen();
  }, [requestFullscreen]);

  // Server-time countdown calculation
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (!currentSession) return exam.settings.durationMinutes * 60;
    const totalMs = exam.settings.durationMinutes * 60 * 1000;
    const elapsedMs = Date.now() - currentSession.startedAt;
    return Math.max(0, Math.floor((totalMs - elapsedMs) / 1000));
  });

  // Timer Tick & Auto-submit
  useEffect(() => {
    if (currentSession?.isCompleted) return;

    const timer = setInterval(() => {
      if (!currentSession) return;
      const totalMs = exam.settings.durationMinutes * 60 * 1000;
      const elapsedMs = Date.now() - currentSession.startedAt;
      const left = Math.max(0, Math.floor((totalMs - elapsedMs) / 1000));
      
      setRemainingSeconds(left);

      if (left <= 0) {
        clearInterval(timer);
        submitExam('AUTO_TIMEOUT');
        onFinish();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession, exam, submitExam, onFinish]);

  // Format timer MM:SS
  const timerFormatted = useMemo(() => {
    const hours = Math.floor(remainingSeconds / 3600);
    const mins = Math.floor((remainingSeconds % 3600) / 60);
    const secs = remainingSeconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [remainingSeconds]);

  const isTimeCritical = remainingSeconds <= 300; // 5 mins
  const isTimeUrgent = remainingSeconds <= 60; // 1 min

  // Current question data
  const currentQuestion: Question | undefined = exam.questions[currentIndex];
  const totalQuestions = exam.questions.length;

  const currentAnswerItem = currentSession?.answers[currentQuestion?.id || ''];
  const currentStudentAnswer = currentAnswerItem?.studentAnswer;
  const isCurrentFlagged = !!currentAnswerItem?.isFlagged;

  // Answer stats for finish confirmation
  const stats = useMemo(() => {
    let answered = 0;
    let flagged = 0;
    exam.questions.forEach((q) => {
      const a = currentSession?.answers[q.id];
      if (a && a.studentAnswer !== undefined && a.studentAnswer !== null && a.studentAnswer !== '') {
        answered += 1;
      }
      if (a?.isFlagged) {
        flagged += 1;
      }
    });
    return {
      answered,
      flagged,
      unanswered: totalQuestions - answered,
    };
  }, [exam.questions, currentSession?.answers, totalQuestions]);

  // Handle Answer Selection
  const handleSelectAnswer = (value: any) => {
    if (currentSession?.isSuspended) return;
    if (!currentQuestion) return;
    updateAnswer(currentQuestion.id, value);
  };

  // Handle Essay input change
  const handleEssayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (currentSession?.isSuspended) return;
    if (!currentQuestion) return;
    updateAnswer(currentQuestion.id, e.target.value);
  };

  // Handle Short Answer input change
  const handleShortAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentSession?.isSuspended) return;
    if (!currentQuestion) return;
    updateAnswer(currentQuestion.id, e.target.value);
  };

  // Handle Unlock PIN submit
  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');
    const res = unlockSessionWithPin(teacherPinInput);
    if (res.success) {
      setPinSuccess(res.message);
      setTeacherPinInput('');
      requestFullscreen();
      setTimeout(() => {
        setPinSuccess('');
      }, 1500);
    } else {
      setPinError(res.message);
    }
  };

  // Handle Submit Confirmation
  const handleFinalSubmit = () => {
    submitExam('MANUAL');
    setIsConfirmModalOpen(false);
    onFinish();
  };

  // Font size styling
  const fontClass = fontSizeLevel === 'xl' ? 'text-lg sm:text-xl' : fontSizeLevel === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base';

  if (!currentQuestion) {
    return <div className="p-8 text-center text-slate-500">Memuat lembar soal...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col select-none">
      {/* Top Fixed CBT Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Exam title & Student */}
          <div className="truncate">
            <h1 className="text-sm font-bold text-slate-900 truncate">
              {exam.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
              <span className="font-semibold text-blue-700">{activeStudent?.name}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{activeStudent?.nisn}</span>
              <span aria-hidden="true">·</span>
              <span className="hidden sm:inline">{exam.subject}</span>
            </div>
          </div>

          {/* Right: Timer & Tools */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Font Size Selector */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
              <button
                onClick={() => setFontSizeLevel('normal')}
                className={`px-2 py-1 rounded transition-colors ${fontSizeLevel === 'normal' ? 'bg-white shadow-xs font-bold text-blue-700' : 'text-slate-600'}`}
                title="Ukuran Font Normal"
              >
                A
              </button>
              <button
                onClick={() => setFontSizeLevel('large')}
                className={`px-2 py-1 rounded transition-colors ${fontSizeLevel === 'large' ? 'bg-white shadow-xs font-bold text-blue-700' : 'text-slate-600'}`}
                title="Ukuran Font Sedang"
              >
                A+
              </button>
              <button
                onClick={() => setFontSizeLevel('xl')}
                className={`px-2 py-1 rounded transition-colors ${fontSizeLevel === 'xl' ? 'bg-white shadow-xs font-bold text-blue-700' : 'text-slate-600'}`}
                title="Ukuran Font Besar"
              >
                A++
              </button>
            </div>

            {/* Autosave Status */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Autosave Aktif</span>
            </div>

            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm tracking-wider transition-colors ${
                isTimeUrgent
                  ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                  : isTimeCritical
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-slate-900 text-white border-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>{timerFormatted}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main 2-Zone Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Question Card (3 columns on desktop) */}
        <section className="lg:col-span-3 flex flex-col">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 flex-1 flex flex-col justify-between">
            <div>
              {/* Question Meta Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                    Soal No. {currentIndex + 1} dari {totalQuestions}
                  </span>
                  <span className="text-xs text-slate-500">
                    Bobot: {currentQuestion.scoreWeight} Poin
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400 capitalize">
                    {currentQuestion.type === 'pg' ? 'Pilihan Ganda' : currentQuestion.type === 'benar_salah' ? 'Benar / Salah' : currentQuestion.type === 'isian' ? 'Isian Singkat' : 'Uraian / Esai'}
                  </span>
                </div>

                {/* Flag / Ragu-ragu Checkbox */}
                <button
                  onClick={() => toggleFlagQuestion(currentQuestion.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    isCurrentFlagged
                      ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-amber-600 text-amber-600' : ''}`} />
                  <span>{isCurrentFlagged ? 'Ditandai Ragu-ragu' : 'Tandai Ragu-ragu'}</span>
                </button>
              </div>

              {/* Question Text */}
              <div className={`text-slate-900 font-medium leading-relaxed mb-8 ${fontClass}`}>
                {currentQuestion.text}
              </div>

              {/* Answer Choices by Type */}
              <div className="space-y-3">
                {/* 1. PILIHAN GANDA (PG) */}
                {currentQuestion.type === 'pg' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = currentStudentAnswer === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleSelectAnswer(option.id)}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/70 border-blue-600 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-blue-700 text-white'
                                : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                            }`}
                          >
                            {option.id}
                          </span>
                          <span className={`text-slate-800 leading-snug pt-0.5 ${fontClass}`}>
                            {option.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. BENAR / SALAH */}
                {currentQuestion.type === 'benar_salah' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(true)}
                      className={`p-5 rounded-xl border font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all cursor-pointer ${
                        currentStudentAnswer === true
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs ring-2 ring-emerald-600/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                      <span>BENAR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(false)}
                      className={`p-5 rounded-xl border font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all cursor-pointer ${
                        currentStudentAnswer === false
                          ? 'bg-red-50 border-red-600 text-red-900 shadow-xs ring-2 ring-red-600/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                        ✕
                      </span>
                      <span>SALAH</span>
                    </button>
                  </div>
                )}

                {/* 3. ISIAN SINGKAT */}
                {currentQuestion.type === 'isian' && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Ketikkan Jawaban Singkat Anda:
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan jawaban eksak..."
                      value={currentStudentAnswer || ''}
                      onChange={handleShortAnswerChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
                    />
                    <span className="text-[11px] text-slate-400 mt-1.5 block">
                      Perhatikan ejaan dan kapitalisasi sesuai petunjuk soal.
                    </span>
                  </div>
                )}

                {/* 4. URAIAN / ESAI */}
                {currentQuestion.type === 'uraian' && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-600">
                        Lembar Jawaban Uraian / Esai:
                      </label>
                      <span className="text-xs text-slate-400">
                        {(currentStudentAnswer || '').length} Karakter
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      placeholder="Tuliskan penjelasan dan argumentasi Anda secara sistematis..."
                      value={currentStudentAnswer || ''}
                      onChange={handleEssayChange}
                      className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Nav Bar */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                  currentIndex === 0
                    ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Soal Sebelumnya</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Soal Selanjutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="px-6 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Selesai & Kirim Ujian</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Right: Question Navigation Matrix (1 column on desktop) */}
        <aside className="lg:col-span-1 space-y-4">
          {/* Palette Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Nomor Soal
            </h3>

            {/* Number grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2 mb-4">
              {exam.questions.map((q, idx) => {
                const answerRec = currentSession?.answers[q.id];
                const hasAnswer = answerRec && answerRec.studentAnswer !== undefined && answerRec.studentAnswer !== null && answerRec.studentAnswer !== '';
                const isFlagged = !!answerRec?.isFlagged;
                const isCurrent = idx === currentIndex;

                let colorClasses = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (isFlagged) {
                  colorClasses = 'bg-amber-400 text-amber-950 font-bold';
                } else if (hasAnswer) {
                  colorClasses = 'bg-blue-700 text-white font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-lg text-xs font-mono transition-all relative flex items-center justify-center ${colorClasses} ${
                      isCurrent ? 'ring-2 ring-blue-900 ring-offset-2 scale-105 z-10' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-950 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-700 shrink-0" />
                <span>Sudah Dijawab ({stats.answered})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-400 shrink-0" />
                <span>Ragu-ragu ({stats.flagged})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-200 shrink-0" />
                <span>Belum Dijawab ({stats.unanswered})</span>
              </div>
            </div>

            {/* Quick Finish Button */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Kirim Jawaban Ujian</span>
              </button>
            </div>
          </div>

          {/* Security & Violation Monitor Widget */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-700" />
                Status Exam Mode
              </span>
              <span className="font-mono text-emerald-600 font-bold">AKTIF</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed mb-2">
              Pelanggaran tercatat: <strong className="text-amber-700 font-mono">{currentSession?.violationCount || 0}</strong> dari batas {exam.settings.maxViolations}x.
            </p>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-amber-500 h-1.5 transition-all" 
                style={{ 
                  width: `${Math.min(100, (((currentSession?.violationCount || 0) / exam.settings.maxViolations) * 100))}%` 
                }} 
              />
            </div>
          </div>
        </aside>
      </main>

      {/* MODAL 1: WARNING POPUP (TERDETEKSI AKTIVITAS MENINGGALKAN HALAMAN UJIAN) */}
      {warningMessage && !currentSession?.isSuspended && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-amber-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Peringatan Keamanan Ujian!
            </h2>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Terdeteksi aktivitas meninggalkan halaman ujian. Silakan kembali ke ujian.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 mb-6 text-left">
              <div className="font-semibold mb-1">Catatan Sistem:</div>
              <ul className="list-disc list-inside space-y-1 text-amber-800">
                <li>Aktivitas perpindahan dicatat di Audit Log Pengawas dengan timestamp.</li>
                <li>Jumlah pelanggaran saat ini: <strong>{currentSession?.violationCount || 1}</strong> dari <strong>{exam.settings.maxViolations}</strong> batas toleransi.</li>
                <li>Ujian akan terkunci jika Anda melanggar kembali.</li>
              </ul>
            </div>

            <button
              onClick={() => {
                clearWarningMessage();
                requestFullscreen();
              }}
              className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Maximize className="w-4 h-4" />
              <span>Kembali ke Ujian Penuh (Fullscreen)</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: UJIAN DITANGGUHKAN (SUSPENDED / LOCKED) */}
      {currentSession?.isSuspended && (
        <div className="fixed inset-0 z-50 bg-red-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-red-300 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Ujian Ditangguhkan
            </h2>
            <div className="text-xs font-semibold text-red-600 mb-4 font-mono">
              STATUS: TERKUNCI OLEH SISTEM KEAMANAN KIOSK
            </div>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Batas toleransi perpindahan tab / jendela ({exam.settings.maxViolations}x) telah habis. Lembar ujian Anda telah dibekukan sementara.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 mb-6 text-left">
              <strong>Jawaban Anda Tetap Aman:</strong> Seluruh jawaban tersimpan otomatis di server. Jawaban tidak dihapus. Silakan panggil <strong>Guru / Pengawas Ruang</strong> untuk memasukkan PIN verifikasi agar ujian dapat dibuka kembali.
            </div>

            {pinError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                {pinError}
              </div>
            )}

            {pinSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                {pinSuccess}
              </div>
            )}

            <form onSubmit={handleUnlockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  MASUKKAN PIN VERIFIKASI PENGAWAS / GURU
                </label>
                <input
                  type="password"
                  placeholder="PIN Pengawas Ruang"
                  value={teacherPinInput}
                  onChange={(e) => setTeacherPinInput(e.target.value)}
                  className="w-full text-center px-4 py-3 rounded-xl border border-slate-300 font-mono tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                Buka Kunci & Lanjutkan Ujian
              </button>
            </form>

            <div className="mt-4 text-[11px] text-slate-400">
              Pengawas Ujian: Masukkan PIN default pengawas (misal: <code>{exam.settings.teacherUnlockPin}</code>).
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: FINISH CONFIRMATION MODAL */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Konfirmasi Selesai Ujian
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Periksa ringkasan lembar jawaban Anda sebelum mengirim secara permanen:
            </p>

            {/* Summary card */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center mb-6">
              <div>
                <span className="text-[11px] text-slate-500 block">Terjawab</span>
                <span className="text-base font-bold text-blue-700 font-mono">
                  {stats.answered}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Ragu-ragu</span>
                <span className="text-base font-bold text-amber-600 font-mono">
                  {stats.flagged}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Belum Terjawab</span>
                <span className="text-base font-bold text-slate-400 font-mono">
                  {stats.unanswered}
                </span>
              </div>
            </div>

            {stats.unanswered > 0 && (
              <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                Peringatan: Masih terdapat <strong>{stats.unanswered} soal</strong> yang belum Anda jawab. Apakah Anda yakin ingin tetap mengirimkan jawaban?
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Ya, Kirim Ujian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
