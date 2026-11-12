/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { ExamSession, Question } from '../../types/exam';
import { Check, X, Award, FileText, CheckCircle2 } from 'lucide-react';

interface EssayGradingModalProps {
  session: ExamSession;
  onClose: () => void;
}

export const EssayGradingModal: React.FC<EssayGradingModalProps> = ({ session, onClose }) => {
  const { exams, gradeEssayQuestion } = useExam();
  const exam = exams.find((e) => e.id === session.examId);

  const essayQuestions = exam?.questions.filter((q) => q.type === 'uraian') || [];

  const [activeQuestionId, setActiveQuestionId] = useState<string>(
    essayQuestions[0]?.id || ''
  );
  
  const currentQ = essayQuestions.find((q) => q.id === activeQuestionId) || essayQuestions[0];
  const answerRecord = session.answers[currentQ?.id || ''];

  const [scoreInput, setScoreInput] = useState<number>(
    answerRecord?.manualScore ?? currentQ?.scoreWeight ?? 15
  );
  const [feedbackInput, setFeedbackInput] = useState<string>(
    answerRecord?.teacherFeedback || ''
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when active question changes
  const handleSelectQuestion = (q: Question) => {
    setActiveQuestionId(q.id);
    const ans = session.answers[q.id];
    setScoreInput(ans?.manualScore ?? q.scoreWeight);
    setFeedbackInput(ans?.teacherFeedback || '');
    setSaveSuccess(false);
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQ) return;

    gradeEssayQuestion(session.id, currentQ.id, Number(scoreInput), feedbackInput);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 1800);
  };

  if (!exam || essayQuestions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
          <p className="text-sm text-slate-600 mb-4">Ujian ini tidak memiliki butir soal uraian/esai.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Koreksi Jawaban Uraian / Esai Siswa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Peserta: <strong>{session.student.name}</strong> ({session.student.nisn}) · {exam.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Selector Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {essayQuestions.map((q, idx) => {
            const isSelected = q.id === activeQuestionId;
            const hasGraded = typeof session.answers[q.id]?.manualScore === 'number';
            return (
              <button
                key={q.id}
                onClick={() => handleSelectQuestion(q)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Soal Esai {idx + 1}</span>
                {hasGraded && <Check className="w-3 h-3 text-emerald-300" />}
              </button>
            );
          })}
        </div>

        {currentQ && (
          <div className="space-y-4">
            {/* Question Text & Rubric */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Pertanyaan Soal (Bobot Maks: {currentQ.scoreWeight} Poin):
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed mb-3">
                {currentQ.text}
              </p>

              {currentQ.rubric && (
                <div className="pt-2 border-t border-slate-200 text-xs text-blue-900 bg-blue-50/70 p-2.5 rounded-lg">
                  <strong className="font-semibold block mb-0.5">Pedoman Rubrik Penilaian:</strong>
                  <span>{currentQ.rubric}</span>
                </div>
              )}
            </div>

            {/* Student's submitted text */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">
                Lembar Jawaban yang Ditulis Siswa:
              </span>
              <div className="p-4 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 leading-relaxed min-h-[120px] whitespace-pre-wrap font-sans">
                {answerRecord?.studentAnswer ? (
                  answerRecord.studentAnswer
                ) : (
                  <span className="italic text-slate-400">Siswa tidak memberikan jawaban uraian.</span>
                )}
              </div>
            </div>

            {/* Score & Feedback Form */}
            <form onSubmit={handleSaveScore} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nilai / Poin yang Diberikan (0 - {currentQ.scoreWeight})
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={currentQ.scoreWeight}
                      value={scoreInput}
                      onChange={(e) => setScoreInput(Number(e.target.value))}
                      className="w-24 px-3 py-1.5 text-base font-bold font-mono rounded-lg border border-slate-300 bg-white text-center text-blue-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500 font-mono">/ {currentQ.scoreWeight} Poin</span>
                  </div>
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Nilai Berhasil Disimpan & Skor Direkapitulasi!</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Catatan Evaluasi / Umpan Balik Guru (Opsional)
                </label>
                <input
                  type="text"
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Contoh: Argumentasi runtut, penjelasan konsep tepat..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Simpan Nilai Koreksi Ini</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
