/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Exam, 
  ExamSession, 
  StudentUser, 
  TeacherUser, 
  UserRole, 
  ViolationLog, 
  ViolationType,
  Question
} from '../types/exam';
import { INITIAL_EXAMS, INITIAL_TEACHER, PRESET_STUDENTS } from '../data/initialData';

const STORAGE_KEYS = {
  EXAMS: 'kasturi_exams_v1',
  SESSIONS: 'kasturi_sessions_v1',
  ROLE: 'kasturi_role_v1',
  ACTIVE_STUDENT: 'kasturi_active_student_v1',
  CURRENT_SESSION_ID: 'kasturi_current_session_id_v1',
};

interface ExamContextType {
  role: UserRole | null;
  teacher: TeacherUser;
  activeStudent: StudentUser | null;
  exams: Exam[];
  sessions: ExamSession[];
  currentSession: ExamSession | null;
  activeExam: Exam | null;
  
  // Auth actions
  loginTeacher: () => void;
  loginStudent: (student: StudentUser) => void;
  logout: () => void;
  
  // Teacher Exam Management
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (examId: string) => void;
  toggleExamStatus: (examId: string) => void;
  
  // Student Session Lifecycle
  findExamByToken: (token: string) => Exam | null;
  startExamSession: (exam: Exam) => ExamSession;
  updateAnswer: (questionId: string, answer: any, isFlagged?: boolean) => void;
  toggleFlagQuestion: (questionId: string) => void;
  recordViolation: (type: ViolationType, title: string, description: string) => void;
  unlockSessionWithPin: (pin: string) => { success: boolean; message: string };
  submitExam: (submissionType?: 'MANUAL' | 'AUTO_TIMEOUT' | 'FORCED_BY_TEACHER') => void;
  
  // Grading & Teacher Ops
  gradeEssayQuestion: (sessionId: string, questionId: string, manualScore: number, feedback?: string) => void;
  deleteSession: (sessionId: string) => void;
  resetAllData: () => void;
  setActiveExam: (exam: Exam | null) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole | null>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || null;
  });

  const [teacher] = useState<TeacherUser>(INITIAL_TEACHER);

  const [activeStudent, setActiveStudent] = useState<StudentUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_STUDENT);
    return saved ? JSON.parse(saved) : null;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_EXAMS;
      }
    }
    return INITIAL_EXAMS;
  });

  const [sessions, setSessions] = useState<ExamSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION_ID) || null;
  });

  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (role) {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ROLE);
    }
  }, [role]);

  useEffect(() => {
    if (activeStudent) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_STUDENT, JSON.stringify(activeStudent));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_STUDENT);
    }
  }, [activeStudent]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION_ID, currentSessionId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION_ID);
    }
  }, [currentSessionId]);

  // Current session object
  const currentSession = sessions.find((s) => s.id === currentSessionId) || null;

  // Sync activeExam with currentSession when running
  useEffect(() => {
    if (currentSession && !activeExam) {
      const exam = exams.find((e) => e.id === currentSession.examId);
      if (exam) {
        setActiveExam(exam);
      }
    }
  }, [currentSession, exams, activeExam]);

  // Auth Methods
  const loginTeacher = () => {
    setRole('guru');
    setActiveStudent(null);
  };

  const loginStudent = (student: StudentUser) => {
    setRole('siswa');
    setActiveStudent(student);
  };

  const logout = () => {
    setRole(null);
    setActiveStudent(null);
    setCurrentSessionId(null);
    setActiveExam(null);
  };

  // Exam Management
  const addExam = (examData: Omit<Exam, 'id' | 'createdAt'>) => {
    const id = `exam-${Date.now()}`;
    const newExam: Exam = {
      ...examData,
      id,
      createdAt: new Date().toISOString(),
    };
    setExams((prev) => [newExam, ...prev]);
  };

  const updateExam = (updated: Exam) => {
    setExams((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    if (activeExam?.id === updated.id) {
      setActiveExam(updated);
    }
  };

  const deleteExam = (examId: string) => {
    setExams((prev) => prev.filter((e) => e.id !== examId));
    setSessions((prev) => prev.filter((s) => s.examId !== examId));
    if (activeExam?.id === examId) {
      setActiveExam(null);
    }
  };

  const toggleExamStatus = (examId: string) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id === examId) {
          const nextStatus = e.status === 'active' ? 'draft' : 'active';
          return { ...e, status: nextStatus };
        }
        return e;
      })
    );
  };

  // Find Exam by Token
  const findExamByToken = (token: string): Exam | null => {
    const cleaned = token.trim().toUpperCase();
    return exams.find(
      (e) =>
        e.status === 'active' &&
        e.settings.isTokenActive &&
        e.settings.examToken.trim().toUpperCase() === cleaned
    ) || null;
  };

  // Calculate Auto Scores for completed session
  const calculateScores = (exam: Exam, session: ExamSession): { totalScore: number; isPassed: boolean; isGraded: boolean } => {
    let earnedScore = 0;
    let hasUngradedEssay = false;

    exam.questions.forEach((q) => {
      const answerRecord = session.answers[q.id];
      if (!answerRecord || answerRecord.studentAnswer === undefined || answerRecord.studentAnswer === null || answerRecord.studentAnswer === '') {
        return;
      }

      if (q.type === 'pg') {
        const isCorrect = String(answerRecord.studentAnswer).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase();
        if (isCorrect) {
          earnedScore += q.scoreWeight;
        }
      } else if (q.type === 'benar_salah') {
        const isCorrect = answerRecord.studentAnswer === q.correctAnswer;
        if (isCorrect) {
          earnedScore += q.scoreWeight;
        }
      } else if (q.type === 'isian') {
        const studentClean = String(answerRecord.studentAnswer).trim().toLowerCase();
        const correctClean = String(q.correctAnswer).trim().toLowerCase();
        if (studentClean === correctClean) {
          earnedScore += q.scoreWeight;
        }
      } else if (q.type === 'uraian') {
        if (typeof answerRecord.manualScore === 'number') {
          earnedScore += answerRecord.manualScore;
        } else {
          hasUngradedEssay = true;
        }
      }
    });

    // Normalize to 0-100 scale based on total possible
    const totalMax = exam.totalPossibleScore || 100;
    const finalScore = Math.round((earnedScore / totalMax) * 100);
    const isPassed = finalScore >= (exam.settings.passScore || 75);

    return {
      totalScore: Math.min(100, Math.max(0, finalScore)),
      isPassed,
      isGraded: !hasUngradedEssay,
    };
  };

  // Start Student Session
  const startExamSession = (exam: Exam): ExamSession => {
    if (!activeStudent) {
      throw new Error('Siswa belum memilih akun!');
    }

    // Check if previous incomplete session exists for this student & exam
    const existingSession = sessions.find(
      (s) => s.examId === exam.id && s.student.id === activeStudent.id && !s.isCompleted
    );

    if (existingSession) {
      setCurrentSessionId(existingSession.id);
      setActiveExam(exam);
      return existingSession;
    }

    const newSessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newSession: ExamSession = {
      id: newSessionId,
      examId: exam.id,
      student: activeStudent,
      startedAt: Date.now(),
      durationSecondsSpent: 0,
      answers: {},
      violations: [],
      violationCount: 0,
      isSuspended: false,
      isCompleted: false,
      isGraded: false,
      lastAutosavedAt: Date.now(),
    };

    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(newSessionId);
    setActiveExam(exam);
    return newSession;
  };

  // Update Answer & Autosave
  const updateAnswer = (questionId: string, answer: any, isFlagged?: boolean) => {
    if (!currentSessionId) return;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== currentSessionId) return s;

        const currentAnswerItem = s.answers[questionId] || {
          questionId,
          studentAnswer: null,
          isFlagged: false,
        };

        const updatedAnswers = {
          ...s.answers,
          [questionId]: {
            ...currentAnswerItem,
            studentAnswer: answer,
            isFlagged: isFlagged !== undefined ? isFlagged : currentAnswerItem.isFlagged,
            answeredAt: Date.now(),
          },
        };

        return {
          ...s,
          answers: updatedAnswers,
          lastAutosavedAt: Date.now(),
        };
      })
    );
  };

  const toggleFlagQuestion = (questionId: string) => {
    if (!currentSessionId) return;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== currentSessionId) return s;

        const currentAnswerItem = s.answers[questionId] || {
          questionId,
          studentAnswer: null,
          isFlagged: false,
        };

        return {
          ...s,
          answers: {
            ...s.answers,
            [questionId]: {
              ...currentAnswerItem,
              isFlagged: !currentAnswerItem.isFlagged,
            },
          },
        };
      })
    );
  };

  // Record Security Violation
  const recordViolation = (type: ViolationType, title: string, description: string) => {
    if (!currentSessionId || !activeExam) return;

    const time = new Date();
    const formatted = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== currentSessionId) return s;

        // Prevent duplicate spam within 800ms
        const lastViolation = s.violations[s.violations.length - 1];
        if (lastViolation && Date.now() - lastViolation.timestamp < 800) {
          return s;
        }

        const newLog: ViolationLog = {
          id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          timestamp: Date.now(),
          timeFormatted: formatted,
          type,
          title,
          description,
        };

        const nextCount = s.violationCount + 1;
        const maxLimit = activeExam.settings.maxViolations || 3;
        const shouldSuspend = nextCount >= maxLimit;

        const logs = [...s.violations, newLog];
        if (shouldSuspend && !s.isSuspended) {
          logs.push({
            id: `v-lock-${Date.now()}`,
            timestamp: Date.now(),
            timeFormatted: formatted,
            type: 'SUSPENDED',
            title: 'Ujian Ditangguhkan Otomatis',
            description: `Batas pelanggaran maksimum (${maxLimit}x) telah terlampaui. Ujian terkunci sampai dibuka oleh pengawas/guru.`,
          });
        }

        return {
          ...s,
          violations: logs,
          violationCount: nextCount,
          isSuspended: shouldSuspend || s.isSuspended,
          suspendedReason: shouldSuspend
            ? `Batas toleransi perpindahan layar (${maxLimit} kali) telah habis.`
            : s.suspendedReason,
        };
      })
    );
  };

  // Unlock Suspended Session with Teacher PIN
  const unlockSessionWithPin = (pin: string): { success: boolean; message: string } => {
    if (!currentSession || !activeExam) {
      return { success: false, message: 'Sesi ujian tidak aktif' };
    }

    const expectedPin = activeExam.settings.teacherUnlockPin || '1234';
    if (pin.trim() !== expectedPin.trim()) {
      return { success: false, message: 'PIN Pengawas / Guru tidak valid! Silakan hubungi pengawas ruang.' };
    }

    const time = new Date();
    const formatted = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== currentSession.id) return s;

        const unfreezeLog: ViolationLog = {
          id: `v-unfreeze-${Date.now()}`,
          timestamp: Date.now(),
          timeFormatted: formatted,
          type: 'UNLOCKED_BY_TEACHER',
          title: 'Verifikasi Pengawas Berhasil',
          description: 'Ujian dibuka kembali oleh Pengawas/Guru. Siswa dapat melanjutkan pengerjaan.',
        };

        return {
          ...s,
          isSuspended: false,
          suspendedReason: undefined,
          // Reset violation count or keep count but add grace allowance
          violationCount: Math.max(0, activeExam.settings.maxViolations - 1),
          violations: [...s.violations, unfreezeLog],
        };
      })
    );

    return { success: true, message: 'Verifikasi berhasil! Ujian telah dibuka kembali.' };
  };

  // Submit Exam
  const submitExam = (submissionType: 'MANUAL' | 'AUTO_TIMEOUT' | 'FORCED_BY_TEACHER' = 'MANUAL') => {
    if (!currentSessionId || !activeExam) return;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== currentSessionId) return s;

        const spentSecs = Math.max(1, Math.round((Date.now() - s.startedAt) / 1000));
        const updatedSession: ExamSession = {
          ...s,
          isCompleted: true,
          submittedAt: Date.now(),
          durationSecondsSpent: spentSecs,
          submissionType,
        };

        const { totalScore, isPassed, isGraded } = calculateScores(activeExam, updatedSession);

        return {
          ...updatedSession,
          totalScore,
          isPassed,
          isGraded,
        };
      })
    );
  };

  // Teacher Grades Open-Ended Essay
  const gradeEssayQuestion = (
    sessionId: string,
    questionId: string,
    manualScore: number,
    feedback?: string
  ) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;

        const exam = exams.find((e) => e.id === s.examId);
        if (!exam) return s;

        const existingAns = s.answers[questionId] || {
          questionId,
          studentAnswer: '',
          isFlagged: false,
        };

        const updatedAnswers = {
          ...s.answers,
          [questionId]: {
            ...existingAns,
            manualScore,
            teacherFeedback: feedback || existingAns.teacherFeedback,
          },
        };

        const updatedSession = {
          ...s,
          answers: updatedAnswers,
        };

        const { totalScore, isPassed, isGraded } = calculateScores(exam, updatedSession);

        return {
          ...updatedSession,
          totalScore,
          isPassed,
          isGraded,
        };
      })
    );
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.EXAMS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_STUDENT);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION_ID);
    setExams(INITIAL_EXAMS);
    setSessions([]);
    setCurrentSessionId(null);
    setActiveStudent(null);
    setRole(null);
    setActiveExam(null);
  };

  return (
    <ExamContext.Provider
      value={{
        role,
        teacher,
        activeStudent,
        exams,
        sessions,
        currentSession,
        activeExam,
        loginTeacher,
        loginStudent,
        logout,
        addExam,
        updateExam,
        deleteExam,
        toggleExamStatus,
        findExamByToken,
        startExamSession,
        updateAnswer,
        toggleFlagQuestion,
        recordViolation,
        unlockSessionWithPin,
        submitExam,
        gradeEssayQuestion,
        deleteSession,
        resetAllData,
        setActiveExam,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
