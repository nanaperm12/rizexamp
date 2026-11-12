/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { Question, QuestionType, QuestionOption } from '../../types/exam';
import { ImportQuestionsModal } from './ImportQuestionsModal';
import { 
  exportQuestionsToCsv, 
  exportQuestionsToJson 
} from '../../utils/exportImportUtils';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  HelpCircle, 
  CheckCircle, 
  FileText, 
  Filter,
  Check,
  X,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  CheckCircle2
} from 'lucide-react';

export const QuestionBankManager: React.FC = () => {
  const { exams, updateExam } = useExam();
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Question Form State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qType, setQType] = useState<QuestionType>('pg');
  const [qText, setQText] = useState('');
  const [qTopic, setQTopic] = useState('Dasar Kejuruan');
  const [qWeight, setQWeight] = useState(15);
  const [qExplanation, setQExplanation] = useState('');
  const [qRubric, setQRubric] = useState('');

  // Options for PG
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' },
    { id: 'E', text: '' },
  ]);
  const [pgCorrectAnswer, setPgCorrectAnswer] = useState('A');

  // Answer for True/False
  const [tfCorrectAnswer, setTfCorrectAnswer] = useState<boolean>(true);

  // Answer for Short Answer
  const [shortCorrectAnswer, setShortCorrectAnswer] = useState('');

  const handleOpenAddModal = () => {
    setEditingQuestionId(null);
    setQType('pg');
    setQText('');
    setQTopic('Materi Inti');
    setQWeight(15);
    setQExplanation('');
    setQRubric('');
    setOptions([
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
      { id: 'E', text: '' },
    ]);
    setPgCorrectAnswer('A');
    setTfCorrectAnswer(true);
    setShortCorrectAnswer('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q: Question) => {
    setEditingQuestionId(q.id);
    setQType(q.type);
    setQText(q.text);
    setQTopic(q.topic || 'Umum');
    setQWeight(q.scoreWeight);
    setQExplanation(q.explanation || '');
    setQRubric(q.rubric || '');

    if (q.type === 'pg' && q.options) {
      setOptions(q.options);
      setPgCorrectAnswer(String(q.correctAnswer));
    } else if (q.type === 'benar_salah') {
      setTfCorrectAnswer(q.correctAnswer === true);
    } else if (q.type === 'isian') {
      setShortCorrectAnswer(String(q.correctAnswer));
    }
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!currentExam) return;
    if (confirm('Hapus butir soal ini dari bank soal?')) {
      const updatedQuestions = currentExam.questions.filter((q) => q.id !== qId);
      updateExam({
        ...currentExam,
        questions: updatedQuestions,
      });
    }
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentExam || !qText.trim()) return;

    let correctAnswerVal: string | boolean = '';
    if (qType === 'pg') {
      correctAnswerVal = pgCorrectAnswer;
    } else if (qType === 'benar_salah') {
      correctAnswerVal = tfCorrectAnswer;
    } else if (qType === 'isian') {
      correctAnswerVal = shortCorrectAnswer.trim();
    } else if (qType === 'uraian') {
      correctAnswerVal = qRubric.trim() || 'Pedoman penskoran guru';
    }

    const questionData: Question = {
      id: editingQuestionId || `q-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      type: qType,
      text: qText.trim(),
      options: qType === 'pg' ? options : undefined,
      correctAnswer: correctAnswerVal,
      scoreWeight: Number(qWeight) || 10,
      topic: qTopic.trim(),
      explanation: qExplanation.trim(),
      rubric: qType === 'uraian' ? qRubric.trim() : undefined,
    };

    let updatedQuestions: Question[];
    if (editingQuestionId) {
      updatedQuestions = currentExam.questions.map((q) =>
        q.id === editingQuestionId ? questionData : q
      );
    } else {
      updatedQuestions = [...currentExam.questions, questionData];
    }

    // Recalculate total score
    const newTotal = updatedQuestions.reduce((acc, q) => acc + q.scoreWeight, 0);

    updateExam({
      ...currentExam,
      questions: updatedQuestions,
      totalPossibleScore: newTotal > 0 ? newTotal : 100,
    });

    setIsModalOpen(false);
  };

  const handleImportQuestions = (newQuestions: Question[], mode: 'append' | 'replace') => {
    if (!currentExam) return;

    let updatedList: Question[] = [];
    if (mode === 'append') {
      updatedList = [...currentExam.questions, ...newQuestions];
    } else {
      updatedList = newQuestions;
    }

    const newTotal = updatedList.reduce((acc, q) => acc + q.scoreWeight, 0);

    updateExam({
      ...currentExam,
      questions: updatedList,
      totalPossibleScore: newTotal > 0 ? newTotal : 100,
    });

    showToast(`Berhasil mengimpor ${newQuestions.length} butir soal ke dalam "${currentExam.title}"!`);
  };

  const handleExportCsv = () => {
    if (!currentExam) return;
    if (currentExam.questions.length === 0) {
      alert('Belum ada butir soal untuk diekspor pada ujian ini.');
      return;
    }
    exportQuestionsToCsv(currentExam);
    showToast(`File CSV soal "${currentExam.code}" berhasil diunduh!`);
  };

  const handleExportJson = () => {
    if (!currentExam) return;
    if (currentExam.questions.length === 0) {
      alert('Belum ada butir soal untuk diekspor pada ujian ini.');
      return;
    }
    exportQuestionsToJson(currentExam);
    showToast(`File JSON soal "${currentExam.code}" berhasil diunduh!`);
  };

  if (!currentExam) {
    return <div className="p-6 text-slate-500 text-sm">Tidak ada ujian yang dipilih.</div>;
  }

  const filteredQuestions = currentExam.questions.filter((q) => {
    if (filterType === 'all') return true;
    return q.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top filter and exam selector bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Pilih Ujian Induk:
          </label>
          <select
            value={currentExam.id}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.code} - {ex.title} ({ex.questions.length} soal)
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls: Import, Export, Add */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Import Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Impor butir soal dari CSV atau JSON"
          >
            <Upload className="w-3.5 h-3.5 text-blue-700" />
            <span>Impor Soal</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
            <button
              onClick={handleExportCsv}
              className="px-2.5 py-1 text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded flex items-center gap-1 transition-colors cursor-pointer font-medium"
              title="Ekspor format CSV (bisa dibuka di Excel / Google Sheets)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor CSV</span>
            </button>
            <span className="w-px h-3.5 bg-slate-200 mx-0.5" />
            <button
              onClick={handleExportJson}
              className="px-2.5 py-1 text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded flex items-center gap-1 transition-colors cursor-pointer font-medium"
              title="Ekspor arsip cadangan JSON"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600" />
              <span>Ekspor JSON</span>
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Butir Soal</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded transition-colors ${filterType === 'all' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Semua Soal ({currentExam.questions.length})
          </button>
          <button
            onClick={() => setFilterType('pg')}
            className={`px-3 py-1.5 rounded transition-colors ${filterType === 'pg' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            PG ({currentExam.questions.filter((q) => q.type === 'pg').length})
          </button>
          <button
            onClick={() => setFilterType('benar_salah')}
            className={`px-3 py-1.5 rounded transition-colors ${filterType === 'benar_salah' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Benar/Salah ({currentExam.questions.filter((q) => q.type === 'benar_salah').length})
          </button>
          <button
            onClick={() => setFilterType('isian')}
            className={`px-3 py-1.5 rounded transition-colors ${filterType === 'isian' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Isian ({currentExam.questions.filter((q) => q.type === 'isian').length})
          </button>
          <button
            onClick={() => setFilterType('uraian')}
            className={`px-3 py-1.5 rounded transition-colors ${filterType === 'uraian' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Uraian ({currentExam.questions.filter((q) => q.type === 'uraian').length})
          </button>
        </div>

        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
          Total Bobot: {currentExam.totalPossibleScore || 100} pt
        </span>
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            Belum ada butir soal untuk kriteria ini. Klik "Tambah Butir Soal" di atas untuk menambahkan.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {q.type === 'pg'
                      ? 'Pilihan Ganda'
                      : q.type === 'benar_salah'
                      ? 'Benar / Salah'
                      : q.type === 'isian'
                      ? 'Isian Singkat'
                      : 'Uraian / Esai'}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 font-mono">Bobot: {q.scoreWeight} pt</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">{q.topic}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(q)}
                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ubah Butir Soal"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Butir Soal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm font-medium text-slate-900 my-3 leading-relaxed">
                {q.text}
              </div>

              {/* Option Preview */}
              {q.type === 'pg' && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 text-xs">
                  {q.options.map((opt) => {
                    const isCorrect = opt.id === q.correctAnswer;
                    return (
                      <div
                        key={opt.id}
                        className={`p-2 rounded-lg border flex items-center gap-2 ${
                          isCorrect
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] ${isCorrect ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                          {opt.id}
                        </span>
                        <span className="truncate">{opt.text}</span>
                        {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-700 ml-auto shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {q.type === 'benar_salah' && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 my-2">
                  Kunci Jawaban:{' '}
                  <strong className={q.correctAnswer ? 'text-emerald-700' : 'text-red-700'}>
                    {q.correctAnswer ? 'BENAR' : 'SALAH'}
                  </strong>
                </div>
              )}

              {q.type === 'isian' && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 my-2">
                  Kunci Jawaban Eksak:{' '}
                  <strong className="text-blue-900 font-mono">{String(q.correctAnswer)}</strong>
                </div>
              )}

              {q.type === 'uraian' && q.rubric && (
                <div className="text-xs text-slate-600 bg-blue-50/60 p-2.5 rounded-lg border border-blue-200 my-2">
                  Pedoman Penskoran:{' '}
                  <span className="text-slate-800">{q.rubric}</span>
                </div>
              )}

              {q.explanation && (
                <div className="mt-2 text-[11px] text-slate-500 italic">
                  Pembahasan: {q.explanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* MODAL: ADD / EDIT QUESTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 my-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingQuestionId ? 'Ubah Butir Soal' : 'Tambah Butir Soal Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Pilih tipe soal (PG, Benar-Salah, Isian Singkat, atau Uraian) dan atur kunci jawaban serta bobot poin.
            </p>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipe Soal
                  </label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value as QuestionType)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="pg">Pilihan Ganda (PG)</option>
                    <option value="benar_salah">Benar / Salah</option>
                    <option value="isian">Isian Singkat</option>
                    <option value="uraian">Uraian / Esai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Topik / Kompetensi
                  </label>
                  <input
                    type="text"
                    value={qTopic}
                    onChange={(e) => setQTopic(e.target.value)}
                    placeholder="Contoh: Logika / Aljabar"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bobot Poin
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={qWeight}
                    onChange={(e) => setQWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Redaksi Butir Soal (Pertanyaan / Pernyataan)
                </label>
                <textarea
                  required
                  rows={4}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Ketikkan teks soal di sini..."
                  className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
                />
              </div>

              {/* SPECIFIC FIELDS BY TYPE */}
              {qType === 'pg' && (
                <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">
                      Opsi Jawaban & Kunci Jawaban
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pilih radio untuk menetapkan kunci jawaban yang benar
                    </span>
                  </div>

                  {options.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="correctOpt"
                          checked={pgCorrectAnswer === opt.id}
                          onChange={() => setPgCorrectAnswer(opt.id)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="w-5 h-5 rounded bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs font-mono">
                          {opt.id}
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOptions((prev) =>
                            prev.map((o) => (o.id === opt.id ? { ...o, text: val } : o))
                          );
                        }}
                        placeholder={`Teks pilihan opsi ${opt.id}...`}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  ))}
                </div>
              )}

              {qType === 'benar_salah' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Kunci Jawaban Pernyataan Ini Adalah:
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-emerald-800 cursor-pointer">
                      <input
                        type="radio"
                        name="tfAnswer"
                        checked={tfCorrectAnswer === true}
                        onChange={() => setTfCorrectAnswer(true)}
                        className="text-emerald-600"
                      />
                      <span>BENAR (True)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-red-800 cursor-pointer">
                      <input
                        type="radio"
                        name="tfAnswer"
                        checked={tfCorrectAnswer === false}
                        onChange={() => setTfCorrectAnswer(false)}
                        className="text-red-600"
                      />
                      <span>SALAH (False)</span>
                    </label>
                  </div>
                </div>
              )}

              {qType === 'isian' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Kunci Jawaban Teks Eksak
                  </label>
                  <input
                    type="text"
                    required
                    value={shortCorrectAnswer}
                    onChange={(e) => setShortCorrectAnswer(e.target.value)}
                    placeholder="Contoh: 14 atau Fotosintesis"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono bg-white focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Pemeriksaan otomatis bersifat case-insensitive (huruf besar/kecil diabaikan).
                  </span>
                </div>
              )}

              {qType === 'uraian' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Pedoman Rubrik Penskoran Guru
                  </label>
                  <textarea
                    rows={3}
                    value={qRubric}
                    onChange={(e) => setQRubric(e.target.value)}
                    placeholder="Contoh: Skor maksimal 25: (1) Menyebutkan definisi (10 poin), (2) Memberi contoh (15 poin)."
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pembahasan / Penjelasan Soal (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Uraian pembahasan materi yang dapat dipelajari guru atau siswa..."
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
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
                  Simpan Butir Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT QUESTIONS */}
      {isImportModalOpen && currentExam && (
        <ImportQuestionsModal
          exam={currentExam}
          onImport={handleImportQuestions}
          onClose={() => setIsImportModalOpen(false)}
        />
      )}
    </div>
  );
};
