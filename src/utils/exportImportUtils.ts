/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Exam, ExamSession, Question, QuestionOption, QuestionType } from '../types/exam';

// Helper to trigger browser file download
export function triggerFileDownload(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// Format date for filename (YYYYMMDD_HHmm)
function getTimestampSlug(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${y}${m}${d}_${h}${min}`;
}

// Escape cell for CSV RFC 4180
function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

// -------------------------------------------------------------
// 1. EXPORT SOAL (QUESTIONS)
// -------------------------------------------------------------

export function exportQuestionsToJson(exam: Exam) {
  const data = {
    exportedAt: new Date().toISOString(),
    examCode: exam.code,
    examTitle: exam.title,
    subject: exam.subject,
    classLevel: exam.classLevel,
    totalQuestions: exam.questions.length,
    totalPossibleScore: exam.totalPossibleScore,
    questions: exam.questions,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const filename = `Soal_${exam.code.replace(/[^a-zA-Z0-9_-]/g, '_')}_${getTimestampSlug()}.json`;
  triggerFileDownload(jsonStr, filename, 'application/json;charset=utf-8');
}

export function exportQuestionsToCsv(exam: Exam) {
  const headers = [
    'No',
    'Tipe Soal',
    'Teks Soal',
    'Opsi A',
    'Opsi B',
    'Opsi C',
    'Opsi D',
    'Opsi E',
    'Kunci Jawaban',
    'Bobot Poin',
    'Topik',
    'Pembahasan',
    'Rubrik Penilaian',
  ];

  const rows = exam.questions.map((q, idx) => {
    let optA = '';
    let optB = '';
    let optC = '';
    let optD = '';
    let optE = '';

    if (q.type === 'pg' && q.options) {
      optA = q.options.find((o) => o.id === 'A')?.text || '';
      optB = q.options.find((o) => o.id === 'B')?.text || '';
      optC = q.options.find((o) => o.id === 'C')?.text || '';
      optD = q.options.find((o) => o.id === 'D')?.text || '';
      optE = q.options.find((o) => o.id === 'E')?.text || '';
    }

    let keyStr = '';
    if (q.type === 'pg' || q.type === 'isian') {
      keyStr = String(q.correctAnswer);
    } else if (q.type === 'benar_salah') {
      keyStr = q.correctAnswer ? 'BENAR' : 'SALAH';
    } else if (q.type === 'uraian') {
      keyStr = String(q.correctAnswer || 'Pedoman penskoran guru');
    }

    return [
      idx + 1,
      q.type,
      q.text,
      optA,
      optB,
      optC,
      optD,
      optE,
      keyStr,
      q.scoreWeight,
      q.topic || '',
      q.explanation || '',
      q.rubric || '',
    ].map(escapeCsvCell).join(',');
  });

  // Prepend UTF-8 BOM so Excel opens properly
  const csvContent = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  const filename = `BankSoal_${exam.code.replace(/[^a-zA-Z0-9_-]/g, '_')}_${getTimestampSlug()}.csv`;
  triggerFileDownload(csvContent, filename, 'text/csv;charset=utf-8');
}

// Download ready-to-fill CSV template with examples
export function downloadQuestionsCsvTemplate() {
  const headers = [
    'No',
    'Tipe Soal',
    'Teks Soal',
    'Opsi A',
    'Opsi B',
    'Opsi C',
    'Opsi D',
    'Opsi E',
    'Kunci Jawaban',
    'Bobot Poin',
    'Topik',
    'Pembahasan',
    'Rubrik Penilaian',
  ];

  const sampleRows = [
    [
      '1',
      'pg',
      'Protokol jaringan yang menggunakan enkripsi SSL/TLS untuk web browser adalah...',
      'HTTP',
      'HTTPS',
      'FTP',
      'DHCP',
      'DNS',
      'B',
      '15',
      'Keamanan Jaringan',
      'HTTPS mengenkripsi lalu lintas web menggunakan TLS port 443.',
      '',
    ],
    [
      '2',
      'benar_salah',
      'Two-Factor Authentication (2FA) hanya membutuhkan password tanpa kode verifikasi tambahan.',
      '',
      '',
      '',
      '',
      '',
      'SALAH',
      '15',
      'Otentikasi',
      '2FA memerlukan dua lapis bukti identitas.',
      '',
    ],
    [
      '3',
      'isian',
      'Alamat IP 192.168.1.1 tergolong dalam IP Privat Kelas apa? (Ketik huruf)',
      '',
      '',
      '',
      '',
      '',
      'C',
      '15',
      'Pengalamatan IP',
      'Kelas C berkisar 192.168.0.0 - 192.168.255.255',
      '',
    ],
    [
      '4',
      'uraian',
      'Jelaskan perbedaan mendasar antara topologi Star dan topologi Bus pada laboratorium komputer!',
      '',
      '',
      '',
      '',
      '',
      'Kunci rubrik esai',
      '25',
      'Topologi Jaringan',
      'Topologi star menggunakan switch sentral, bus menggunakan kabel linear.',
      'Maks 25 poin: definisi (10 poin), kelebihan/kelemahan (15 poin)',
    ],
  ];

  const csvContent =
    '\uFEFF' +
    [
      headers.map(escapeCsvCell).join(','),
      ...sampleRows.map((r) => r.map(escapeCsvCell).join(',')),
    ].join('\r\n');

  triggerFileDownload(csvContent, 'Template_Import_Soal_CBT.csv', 'text/csv;charset=utf-8');
}

// -------------------------------------------------------------
// 2. IMPORT SOAL PARSERS
// -------------------------------------------------------------

export function parseQuestionsFromJson(jsonStr: string): {
  success: boolean;
  questions: Question[];
  errors: string[];
} {
  const errors: string[] = [];
  try {
    const parsed = JSON.parse(jsonStr);
    const rawList = Array.isArray(parsed) ? parsed : parsed.questions;

    if (!Array.isArray(rawList)) {
      return { success: false, questions: [], errors: ['Format JSON tidak valid: Properti "questions" harus berupa array'] };
    }

    const validated: Question[] = [];

    rawList.forEach((item: any, idx: number) => {
      const qNum = idx + 1;
      if (!item.text || typeof item.text !== 'string' || !item.text.trim()) {
        errors.push(`Soal #${qNum}: Teks soal tidak boleh kosong`);
        return;
      }

      let type: QuestionType = 'pg';
      const rawType = String(item.type || '').toLowerCase().trim();
      if (['pg', 'pilihan_ganda', 'multiple_choice'].includes(rawType)) {
        type = 'pg';
      } else if (['benar_salah', 'true_false', 'tf'].includes(rawType)) {
        type = 'benar_salah';
      } else if (['isian', 'short_answer', 'isian_singkat'].includes(rawType)) {
        type = 'isian';
      } else if (['uraian', 'essay', 'esai'].includes(rawType)) {
        type = 'uraian';
      }

      let options: QuestionOption[] | undefined = undefined;
      if (type === 'pg') {
        if (Array.isArray(item.options) && item.options.length >= 2) {
          options = item.options.map((opt: any, oIdx: number) => {
            const letter = ['A', 'B', 'C', 'D', 'E'][oIdx] || `Opt${oIdx + 1}`;
            return {
              id: opt.id || letter,
              text: typeof opt === 'string' ? opt : opt.text || '',
            };
          });
        } else {
          // Default fallback options if missing
          options = [
            { id: 'A', text: 'Pilihan A' },
            { id: 'B', text: 'Pilihan B' },
            { id: 'C', text: 'Pilihan C' },
            { id: 'D', text: 'Pilihan D' },
          ];
        }
      }

      let correctAnswer: string | boolean = item.correctAnswer;
      if (type === 'benar_salah') {
        if (typeof correctAnswer === 'string') {
          correctAnswer = correctAnswer.trim().toUpperCase() === 'BENAR' || correctAnswer.trim().toUpperCase() === 'TRUE';
        } else {
          correctAnswer = Boolean(correctAnswer);
        }
      } else if (type === 'pg') {
        correctAnswer = String(correctAnswer || 'A').toUpperCase().trim();
      } else {
        correctAnswer = String(correctAnswer || '');
      }

      validated.push({
        id: item.id || `q-imported-${Date.now()}-${idx}`,
        type,
        text: item.text.trim(),
        options,
        correctAnswer,
        scoreWeight: Number(item.scoreWeight) || 10,
        topic: String(item.topic || 'Umum'),
        explanation: item.explanation ? String(item.explanation) : undefined,
        rubric: item.rubric ? String(item.rubric) : undefined,
      });
    });

    return {
      success: validated.length > 0,
      questions: validated,
      errors,
    };
  } catch (err: any) {
    return {
      success: false,
      questions: [],
      errors: [`Gagal memproses file JSON: ${err.message || 'Sintaks tidak valid'}`],
    };
  }
}

// Robust CSV Line Splitter adhering to RFC 4180
function parseCsvRows(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, ''); // strip BOM
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip CRLF
      }
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.some((f) => f.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((f) => f.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export function parseQuestionsFromCsv(csvStr: string): {
  success: boolean;
  questions: Question[];
  errors: string[];
} {
  const errors: string[] = [];
  const rows = parseCsvRows(csvStr);

  if (rows.length < 2) {
    return {
      success: false,
      questions: [],
      errors: ['File CSV kosong atau tidak memiliki baris data setelah header.'],
    };
  }

  // Header row index lookup
  const headers = rows[0].map((h) => h.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_'));

  const findIdx = (names: string[]): number => {
    return headers.findIndex((h) => names.some((n) => h.includes(n)));
  };

  const typeIdx = findIdx(['tipe', 'type']);
  const textIdx = findIdx(['soal', 'teks', 'pertanyaan', 'question']);
  const optAIdx = findIdx(['opsi_a', 'pilihan_a', 'a']);
  const optBIdx = findIdx(['opsi_b', 'pilihan_b', 'b']);
  const optCIdx = findIdx(['opsi_c', 'pilihan_c', 'c']);
  const optDIdx = findIdx(['opsi_d', 'pilihan_d', 'd']);
  const optEIdx = findIdx(['opsi_e', 'pilihan_e', 'e']);
  const keyIdx = findIdx(['kunci', 'jawaban', 'answer', 'key']);
  const weightIdx = findIdx(['bobot', 'poin', 'skor', 'weight']);
  const topicIdx = findIdx(['topik', 'materi', 'topic', 'kd']);
  const expIdx = findIdx(['pembahasan', 'penjelasan', 'explanation']);
  const rubricIdx = findIdx(['rubrik', 'pedoman', 'rubric']);

  if (textIdx === -1) {
    return {
      success: false,
      questions: [],
      errors: ['Kolom "Teks Soal" tidak ditemukan di baris header CSV. Gunakan template resmi kami.'],
    };
  }

  const questions: Question[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const qNum = r;
    const text = (row[textIdx] || '').trim();

    if (!text) continue; // skip blank row

    // Determine type
    const rawType = (typeIdx !== -1 ? row[typeIdx] : 'pg').toLowerCase().trim();
    let type: QuestionType = 'pg';
    if (rawType.includes('benar') || rawType.includes('salah') || rawType === 'tf') {
      type = 'benar_salah';
    } else if (rawType.includes('isian') || rawType.includes('singkat')) {
      type = 'isian';
    } else if (rawType.includes('uraian') || rawType.includes('esai') || rawType.includes('essay')) {
      type = 'uraian';
    } else {
      type = 'pg';
    }

    // Options
    let options: QuestionOption[] | undefined = undefined;
    if (type === 'pg') {
      const a = (optAIdx !== -1 ? row[optAIdx] : '').trim();
      const b = (optBIdx !== -1 ? row[optBIdx] : '').trim();
      const c = (optCIdx !== -1 ? row[optCIdx] : '').trim();
      const d = (optDIdx !== -1 ? row[optDIdx] : '').trim();
      const e = (optEIdx !== -1 ? row[optEIdx] : '').trim();

      const opts: QuestionOption[] = [];
      if (a) opts.push({ id: 'A', text: a });
      if (b) opts.push({ id: 'B', text: b });
      if (c) opts.push({ id: 'C', text: c });
      if (d) opts.push({ id: 'D', text: d });
      if (e) opts.push({ id: 'E', text: e });

      if (opts.length < 2) {
        errors.push(`Baris ${qNum}: Soal pilihan ganda minimal harus memiliki opsi A dan B.`);
      }
      options = opts;
    }

    // Key
    const rawKey = (keyIdx !== -1 ? row[keyIdx] : '').trim();
    let correctAnswer: string | boolean = rawKey;
    if (type === 'benar_salah') {
      const upper = rawKey.toUpperCase();
      correctAnswer = upper === 'BENAR' || upper === 'TRUE' || upper === 'B';
    } else if (type === 'pg') {
      correctAnswer = rawKey.toUpperCase() || 'A';
    }

    const weight = weightIdx !== -1 && Number(row[weightIdx]) ? Number(row[weightIdx]) : 10;
    const topic = topicIdx !== -1 && row[topicIdx] ? row[topicIdx].trim() : 'Umum';
    const explanation = expIdx !== -1 && row[expIdx] ? row[expIdx].trim() : undefined;
    const rubric = rubricIdx !== -1 && row[rubricIdx] ? row[rubricIdx].trim() : undefined;

    questions.push({
      id: `q-csv-${Date.now()}-${r}`,
      type,
      text,
      options,
      correctAnswer,
      scoreWeight: weight,
      topic,
      explanation,
      rubric,
    });
  }

  return {
    success: questions.length > 0,
    questions,
    errors,
  };
}

// -------------------------------------------------------------
// 3. EXPORT HASIL UJIAN (EXAM RESULTS & AUDIT LOGS)
// -------------------------------------------------------------

export function exportResultsToCsv(exam: Exam, sessions: ExamSession[]) {
  // Table headers
  const baseHeaders = [
    'No',
    'NISN',
    'Nama Lengkap Siswa',
    'Kelas / Rombel',
    'Sekolah',
    'Status Pengerjaan',
    'Waktu Mulai',
    'Waktu Selesai',
    'Durasi (Menit)',
    'Jumlah Pelanggaran Kiosk',
    'Ujian Ditangguhkan',
    'Nilai Total (Skala 100)',
    'Target KKM',
    'Status Ketuntasan KKM',
    'Status Koreksi',
  ];

  // Optional per-question headers
  const questionHeaders = exam.questions.map((q, idx) => `Soal #${idx + 1} (${q.type})`);
  const allHeaders = [...baseHeaders, ...questionHeaders];

  const rows = sessions.map((sess, idx) => {
    const isCompleted = sess.isCompleted;
    const startedAtFormatted = sess.startedAt
      ? new Date(sess.startedAt).toLocaleString('id-ID', { hour12: false })
      : '-';
    const submittedAtFormatted = sess.submittedAt
      ? new Date(sess.submittedAt).toLocaleString('id-ID', { hour12: false })
      : isCompleted
      ? 'Terkirim'
      : 'Belum Selesai';
    const durationMinutes = Math.round(sess.durationSecondsSpent / 60);

    const statusPengerjaan = sess.isSuspended
      ? 'Ditangguhkan'
      : isCompleted
      ? 'Selesai Dikumpulkan'
      : 'Sedang Mengerjakan';

    const kkmStatus =
      sess.totalScore !== undefined
        ? sess.isPassed
          ? 'TUNTAS'
          : 'REMEDIAL'
        : 'Belum Ada Nilai';

    const gradingStatus = sess.isGraded ? 'Lengkap' : 'Menunggu Koreksi Esai';

    const baseRow = [
      idx + 1,
      sess.student.nisn,
      sess.student.name,
      sess.student.classGrade,
      sess.student.school || 'SMKN 1 Surabaya',
      statusPengerjaan,
      startedAtFormatted,
      submittedAtFormatted,
      durationMinutes,
      sess.violationCount,
      sess.isSuspended ? 'YA' : 'TIDAK',
      sess.totalScore !== undefined ? sess.totalScore : '-',
      exam.settings.passScore,
      kkmStatus,
      gradingStatus,
    ];

    // Per-question student response details
    const questionDetails = exam.questions.map((q) => {
      const ansRec = sess.answers[q.id];
      if (!ansRec || ansRec.studentAnswer === undefined || ansRec.studentAnswer === null) {
        return '[Tidak Dijawab]';
      }
      if (q.type === 'uraian') {
        const score = ansRec.manualScore !== undefined ? ` (Skor: ${ansRec.manualScore})` : ' (Belum dinilai)';
        return `${String(ansRec.studentAnswer).replace(/\r?\n/g, ' ')}${score}`;
      }
      return String(ansRec.studentAnswer);
    });

    return [...baseRow, ...questionDetails].map(escapeCsvCell).join(',');
  });

  const summaryHeader = [
    `REKAPITULASI HASIL ASESMEN DIGITAL - ${exam.title}`,
    `Kode Ujian: ${exam.code} | Mata Pelajaran: ${exam.subject} | KKM: ${exam.settings.passScore}`,
    `Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}`,
    '',
  ];

  const csvContent =
    '\uFEFF' +
    [
      ...summaryHeader.map((line) => `"${line}"`),
      allHeaders.map(escapeCsvCell).join(','),
      ...rows,
    ].join('\r\n');

  const filename = `RekapNilai_${exam.code.replace(/[^a-zA-Z0-9_-]/g, '_')}_${getTimestampSlug()}.csv`;
  triggerFileDownload(csvContent, filename, 'text/csv;charset=utf-8');
}

export function exportResultsToJson(exam: Exam, sessions: ExamSession[]) {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    exam,
    totalParticipants: sessions.length,
    completedParticipants: sessions.filter((s) => s.isCompleted).length,
    sessions,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const filename = `HasilAsesmen_${exam.code.replace(/[^a-zA-Z0-9_-]/g, '_')}_${getTimestampSlug()}.json`;
  triggerFileDownload(jsonStr, filename, 'application/json;charset=utf-8');
}

export function exportAuditLogsToCsv(exam: Exam, sessions: ExamSession[]) {
  const headers = [
    'No',
    'Timestamp (WIB)',
    'NISN',
    'Nama Siswa',
    'Kelas',
    'Jenis Pelanggaran',
    'Judul Peristiwa',
    'Deskripsi Detail',
    'Status Suspensi',
  ];

  const allLogs: string[][] = [];
  let counter = 1;

  sessions.forEach((sess) => {
    sess.violations.forEach((v) => {
      allLogs.push([
        String(counter++),
        v.timeFormatted,
        sess.student.nisn,
        sess.student.name,
        sess.student.classGrade,
        v.type,
        v.title,
        v.description,
        sess.isSuspended ? 'Ujian Ditangguhkan' : 'Aktif',
      ]);
    });
  });

  const rows = allLogs.map((r) => r.map(escapeCsvCell).join(','));

  const csvContent =
    '\uFEFF' +
    [
      `"AUDIT LOG KEAMANAN KIOSK - ${exam.title}"`,
      `"Kode Ujian: ${exam.code} | Total Insiden: ${allLogs.length}"`,
      '',
      headers.map(escapeCsvCell).join(','),
      ...rows,
    ].join('\r\n');

  const filename = `AuditLog_${exam.code.replace(/[^a-zA-Z0-9_-]/g, '_')}_${getTimestampSlug()}.csv`;
  triggerFileDownload(csvContent, filename, 'text/csv;charset=utf-8');
}
