/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Exam, ExamSession, TeacherUser } from '../../types/exam';
import { Printer, ArrowLeft } from 'lucide-react';

interface PrintableReportProps {
  exam: Exam;
  sessions: ExamSession[];
  teacher: TeacherUser;
  onBack: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  exam,
  sessions,
  teacher,
  onBack,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const completedSessions = sessions.filter((s) => s.isCompleted);
  const totalPassed = completedSessions.filter((s) => s.isPassed).length;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Top action bar - Hidden during print */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Dashboard</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen Resmi (Ctrl+P)</span>
        </button>
      </div>

      {/* Official Indonesian School Document Container */}
      <div className="bg-white p-8 sm:p-12 border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0 text-slate-900 font-serif">
        {/* Kop Surat Resmi */}
        <div className="border-b-2 border-black pb-4 mb-6 text-center">
          <div className="text-xs uppercase tracking-widest font-sans font-bold text-slate-600">
            Pemerintah Provinsi Jawa Timur · Dinas Pendidikan
          </div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-black mt-0.5">
            SMK NEGERI 1 SURABAYA (PUSAT KEUNGGULAN)
          </h1>
          <p className="text-xs font-sans text-slate-600 mt-0.5">
            Jl. SMEA No.4, Wonokromo, Kec. Wonokromo, Kota Surabaya, Jawa Timur 60243 · NPSN: 20532219
          </p>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-base font-bold underline uppercase tracking-wide">
            BERITA ACARA PELAKSANAAN ASESMEN SUMATIF DIGITAL
          </h2>
          <div className="text-xs font-sans text-slate-600 mt-1">
            Nomor: 421.5 / {Math.floor(100 + Math.random() * 900)} / SMKN1-SBY / {new Date().getFullYear()}
          </div>
        </div>

        {/* Context Statement */}
        <p className="text-xs leading-relaxed text-justify mb-4">
          Pada hari ini, <strong className="font-sans">{todayFormatted}</strong>, telah diselenggarakan Asesmen Digital Berbasis Komputer (CBT / Kiosk Examination) dengan rincian data sebagai berikut:
        </p>

        {/* Metadata table */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs font-sans mb-6 bg-slate-50 p-4 border border-slate-200 rounded">
          <div>
            <span className="text-slate-500 inline-block w-36">Mata Pelajaran:</span>
            <strong>{exam.subject}</strong>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-36">Tingkat Kelas:</span>
            <strong>{exam.classLevel}</strong>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-36">Judul Asesmen:</span>
            <strong>{exam.title}</strong>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-36">Alokasi Waktu:</span>
            <strong>{exam.settings.durationMinutes} Menit</strong>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-36">Guru Pengampu:</span>
            <strong>{teacher.name}</strong>
          </div>
          <div>
            <span className="text-slate-500 inline-block w-36">KKM Standar:</span>
            <strong>{exam.settings.passScore} Poin</strong>
          </div>
        </div>

        {/* Attendance Summary */}
        <p className="text-xs leading-relaxed text-justify mb-3">
          Berdasarkan catatan sistem pemantauan Kiosk Exam Mode, tercatat <strong>{sessions.length}</strong> peserta terdaftar, <strong>{completedSessions.length}</strong> peserta telah mengumpulkan lembar jawaban, dan <strong>{totalPassed}</strong> peserta dinyatakan tuntas mencapai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP/KKM).
        </p>

        {/* Table of Scores */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2 font-sans">
            Lampiran: Daftar Rekapitulasi Nilai Peserta Didik
          </h3>
          <table className="w-full text-left text-xs border-collapse border border-slate-300 font-sans">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="border border-slate-300 p-2 text-center w-10">No</th>
                <th className="border border-slate-300 p-2">NISN</th>
                <th className="border border-slate-300 p-2">Nama Lengkap Siswa</th>
                <th className="border border-slate-300 p-2">Rombel</th>
                <th className="border border-slate-300 p-2 text-center">Pelanggaran</th>
                <th className="border border-slate-300 p-2 text-center">Nilai</th>
                <th className="border border-slate-300 p-2 text-center">Ketuntasan</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border border-slate-300 p-4 text-center text-slate-400">
                    Belum ada rekaman nilai peserta.
                  </td>
                </tr>
              ) : (
                sessions.map((sess, idx) => (
                  <tr key={sess.id}>
                    <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-mono">{sess.student.nisn}</td>
                    <td className="border border-slate-300 p-2 font-medium">{sess.student.name}</td>
                    <td className="border border-slate-300 p-2">{sess.student.classGrade}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">
                      {sess.violationCount}x
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-bold font-mono">
                      {sess.totalScore !== undefined ? sess.totalScore : '-'}
                    </td>
                    <td className="border border-slate-300 p-2 text-center">
                      {sess.totalScore !== undefined ? (
                        sess.isPassed ? 'Tuntas' : 'Remedial'
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 text-xs font-sans pt-6 text-center break-inside-avoid">
          <div>
            <p className="text-slate-600 mb-16">
              Mengetahui,<br />
              Kepala SMK Negeri 1 Surabaya
            </p>
            <p className="font-bold underline text-slate-900">Dr. H. Anton Sujarwo, M.Pd.</p>
            <p className="text-slate-500 font-mono text-[11px]">NIP. 19710315 199601 1 002</p>
          </div>

          <div>
            <p className="text-slate-600 mb-16">
              Surabaya, {todayFormatted}<br />
              Guru Pengampu / Penanggung Jawab
            </p>
            <p className="font-bold underline text-slate-900">{teacher.name}</p>
            <p className="text-slate-500 font-mono text-[11px]">NIP. {teacher.nip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
