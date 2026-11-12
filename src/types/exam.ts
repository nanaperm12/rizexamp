/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'guru' | 'siswa';

export interface TeacherUser {
  id: string;
  name: string;
  nip: string;
  school: string;
  email: string;
}

export interface StudentUser {
  id: string;
  nisn: string;
  name: string;
  classGrade: string;
  school: string;
}

export type QuestionType = 'pg' | 'isian' | 'benar_salah' | 'uraian';

export interface QuestionOption {
  id: string; // 'A', 'B', 'C', 'D', 'E'
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: QuestionOption[]; // for 'pg'
  correctAnswer: string | boolean; // string for 'pg' (e.g. 'A') and 'isian' (e.g. 'Photosintesis'), boolean for 'benar_salah'
  scoreWeight: number; // e.g. 10 or 25
  rubric?: string; // guidance for teacher grading essay
  topic: string;
  explanation?: string;
}

export interface ExamSettings {
  durationMinutes: number; // Durasi ujian dalam menit (misal: 60)
  passScore: number; // Kriteria Ketuntasan Minimal (KKM), misal: 75
  maxViolations: number; // Batas toleransi pelanggaran sebelum dikunci (default: 3)
  shuffleQuestions: boolean; // Acak urutan butir soal
  shuffleOptions: boolean; // Acak urutan opsi pilihan ganda
  allowStudentViewScore: boolean; // Siswa dapat melihat nilai langsung setelah selesai
  strictExamMode: boolean; // Wajibkan mode layar penuh & deteksi tab/blur
  teacherUnlockPin: string; // PIN pengawas/guru untuk membuka suspensi ujian
  scheduledStartTime: string; // ISO string format YYYY-MM-DDTHH:mm
  scheduledEndTime: string; // ISO string format YYYY-MM-DDTHH:mm
  examToken: string; // Token ujian, misal: 'ANBK26'
  isTokenActive: boolean;
}

export interface Exam {
  id: string;
  code: string;
  title: string;
  subject: string;
  classLevel: string;
  academicYear: string;
  questions: Question[];
  settings: ExamSettings;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  totalPossibleScore: number;
}

export type ViolationType = 
  | 'TAB_SWITCH' 
  | 'WINDOW_BLUR' 
  | 'FULLSCREEN_EXIT' 
  | 'KEY_SHORTCUT' 
  | 'CONTEXT_MENU' 
  | 'SUSPENDED' 
  | 'UNLOCKED_BY_TEACHER';

export interface ViolationLog {
  id: string;
  timestamp: number;
  timeFormatted: string;
  type: ViolationType;
  title: string;
  description: string;
}

export interface StudentAnswerItem {
  questionId: string;
  studentAnswer: any; // 'A', 'B', true/false, text string
  isFlagged: boolean; // Ragu-ragu
  answeredAt?: number;
  autoScore?: number;
  manualScore?: number;
  teacherFeedback?: string;
}

export interface ExamSession {
  id: string;
  examId: string;
  student: StudentUser;
  startedAt: number; // timestamp ms
  submittedAt?: number; // timestamp ms
  durationSecondsSpent: number;
  answers: Record<string, StudentAnswerItem>; // key: questionId
  violations: ViolationLog[];
  violationCount: number;
  isSuspended: boolean;
  suspendedReason?: string;
  isCompleted: boolean;
  submissionType?: 'MANUAL' | 'AUTO_TIMEOUT' | 'FORCED_BY_TEACHER';
  totalScore?: number;
  isPassed?: boolean;
  isGraded: boolean;
  lastAutosavedAt?: number;
}
