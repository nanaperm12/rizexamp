/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { Exam } from '../../types/exam';
import { StudentExamEntry } from './StudentExamEntry';
import { StudentInstructionView } from './StudentInstructionView';
import { StudentExamScreen } from './StudentExamScreen';
import { StudentFinishedScreen } from './StudentFinishedScreen';

export const StudentFlow: React.FC = () => {
  const { currentSession, activeExam, startExamSession, setActiveExam } = useExam();
  const [step, setStep] = useState<'entry' | 'instructions' | 'exam' | 'finished'>(() => {
    if (currentSession?.isCompleted) return 'finished';
    if (currentSession && !currentSession.isCompleted) return 'exam';
    return 'entry';
  });

  const [selectedExam, setSelectedExam] = useState<Exam | null>(activeExam);

  const handleSelectExam = (exam: Exam) => {
    setSelectedExam(exam);
    setActiveExam(exam);
    setStep('instructions');
  };

  const handleStartExam = () => {
    if (!selectedExam) return;
    startExamSession(selectedExam);
    setStep('exam');
  };

  const handleExamFinished = () => {
    setStep('finished');
  };

  const handleBackToEntry = () => {
    setStep('entry');
    setSelectedExam(null);
  };

  return (
    <div>
      {step === 'entry' && <StudentExamEntry onSelectExam={handleSelectExam} />}
      
      {step === 'instructions' && selectedExam && (
        <StudentInstructionView
          exam={selectedExam}
          onBack={handleBackToEntry}
          onStartExam={handleStartExam}
        />
      )}

      {step === 'exam' && selectedExam && (
        <StudentExamScreen
          exam={selectedExam}
          onFinish={handleExamFinished}
        />
      )}

      {step === 'finished' && selectedExam && (
        <StudentFinishedScreen
          exam={selectedExam}
          onHome={handleBackToEntry}
        />
      )}
    </div>
  );
};
