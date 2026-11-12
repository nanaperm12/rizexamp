/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Exam, Question } from '../../types/exam';
import { 
  parseQuestionsFromCsv, 
  parseQuestionsFromJson, 
  downloadQuestionsCsvTemplate 
} from '../../utils/exportImportUtils';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  FileCode, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ImportQuestionsModalProps {
  exam: Exam;
  onImport: (newQuestions: Question[], mode: 'append' | 'replace') => void;
  onClose: () => void;
}

export const ImportQuestionsModal: React.FC<ImportQuestionsModalProps> = ({
  exam,
  onImport,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      processFile(dropped);
    }
  };

  const processFile = (f: File) => {
    setFile(f);
    setIsProcessing(true);
    setParseErrors([]);
    setParsedQuestions([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const isCsv = f.name.toLowerCase().endsWith('.csv');
      const isJson = f.name.toLowerCase().endsWith('.json');

      if (isCsv) {
        const result = parseQuestionsFromCsv(content);
        setParsedQuestions(result.questions);
        setParseErrors(result.errors);
      } else if (isJson) {
        const result = parseQuestionsFromJson(content);
        setParsedQuestions(result.questions);
        setParseErrors(result.errors);
      } else {
        setParseErrors(['Format file tidak didukung. Harap unggah file berekstensi .csv atau .json.']);
      }
      setIsProcessing(false);
    };

    reader.onerror = () => {
      setParseErrors(['Gagal membaca file dari perangkat Anda.']);
      setIsProcessing(false);
    };

    reader.readAsText(f);
  };

  const handleConfirmImport = () => {
    if (parsedQuestions.length === 0) return;
    onImport(parsedQuestions, importMode);
    onClose();
  };

  // Breakdown counts
  const typeCounts = {
    pg: parsedQuestions.filter((q) => q.type === 'pg').length,
    benar_salah: parsedQuestions.filter((q) => q.type === 'benar_salah').length,
    isian: parsedQuestions.filter((q) => q.type === 'isian').length,
    uraian: parsedQuestions.filter((q) => q.type === 'uraian').length,
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Impor Bank Soal (CSV / JSON)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Target Asesmen: <strong className="text-blue-900">{exam.title}</strong> ({exam.code})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Helper Card */}
        <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-sky-950 block">
                Belum memiliki format file yang sesuai?
              </span>
              <p className="text-[11px] text-sky-800/90 mt-0.5 leading-relaxed">
                Unduh template CSV resmi kami yang siap diedit di Excel atau Google Sheets dengan contoh butir soal PG, Benar-Salah, Isian, dan Uraian.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={downloadQuestionsCsvTemplate}
            className="px-3 py-1.5 bg-white border border-sky-300 hover:bg-sky-100 text-sky-900 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-700" />
            <span>Unduh Template CSV</span>
          </button>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
            file
              ? 'border-blue-400 bg-blue-50/30'
              : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .json, application/json, text/csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-800">
            {file ? file.name : 'Klik untuk memilih file atau seret file CSV / JSON ke sini'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Mendukung file spreadsheet .CSV dan berkas arsip .JSON (Maksimal 10MB)
          </p>
        </div>

        {/* Parsing Results & Validation */}
        {isProcessing && (
          <div className="py-6 text-center text-xs text-slate-500">
            Sedang membaca dan memvalidasi struktur butir soal...
          </div>
        )}

        {parsedQuestions.length > 0 && !isProcessing && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Berhasil Membaca {parsedQuestions.length} Butir Soal
                </span>
                <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                  Valid
                </span>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                <div className="bg-white/80 p-2 rounded border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">PG</span>
                  <strong className="text-emerald-900 font-mono">{typeCounts.pg}</strong>
                </div>
                <div className="bg-white/80 p-2 rounded border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">Benar/Salah</span>
                  <strong className="text-emerald-900 font-mono">{typeCounts.benar_salah}</strong>
                </div>
                <div className="bg-white/80 p-2 rounded border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">Isian</span>
                  <strong className="text-emerald-900 font-mono">{typeCounts.isian}</strong>
                </div>
                <div className="bg-white/80 p-2 rounded border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">Uraian</span>
                  <strong className="text-emerald-900 font-mono">{typeCounts.uraian}</strong>
                </div>
              </div>
            </div>

            {/* Import Mode Radio */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Metode Penggabungan Soal:
              </label>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-blue-600"
                  />
                  <span>
                    <strong>Tambahkan</strong> ke butir soal yang sudah ada ({exam.questions.length} butir saat ini). Total akan menjadi {exam.questions.length + parsedQuestions.length} butir.
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-red-700">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-red-600"
                  />
                  <span>
                    <strong>Ganti seluruhnya</strong> (menimpa {exam.questions.length} butir soal lama dengan {parsedQuestions.length} butir baru).
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Warnings / Errors */}
        {parseErrors.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Catatan / Peringatan Validasi:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
              {parseErrors.slice(0, 4).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {parseErrors.length > 4 && (
                <li>...dan {parseErrors.length - 4} catatan lainnya.</li>
              )}
            </ul>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={parsedQuestions.length === 0}
            onClick={handleConfirmImport}
            className={`px-5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 ${
              parsedQuestions.length > 0
                ? 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Terapkan Impor ({parsedQuestions.length} Butir Soal)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
