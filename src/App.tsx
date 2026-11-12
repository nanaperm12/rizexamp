/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ExamProvider, useExam } from './context/ExamContext';
import { Navbar } from './components/layout/Navbar';
import { DeviceSecurityNotice } from './components/common/DeviceSecurityNotice';
import { LandingHero } from './components/home/LandingHero';
import { LoginView } from './components/auth/LoginView';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentFlow } from './components/student/StudentFlow';

const MainApp: React.FC = () => {
  const { role, currentSession } = useExam();
  const [currentNavView, setCurrentNavView] = useState<string>('home');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // When student is in the middle of an active uncompleted exam, suppress navbar distractions
  const isInActiveExam = role === 'siswa' && currentSession && !currentSession.isCompleted;

  const handleNavigate = (view: string) => {
    if (view === 'login') {
      setShowLoginModal(true);
    } else {
      setCurrentNavView(view);
      setShowLoginModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Security Disclaimer Banner */}
      {!isInActiveExam && <DeviceSecurityNotice />}

      {/* Top Navigation */}
      {!isInActiveExam && (
        <Navbar currentView={currentNavView} onNavigate={handleNavigate} />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {showLoginModal || (currentNavView === 'login' && !role) ? (
          <LoginView
            onSuccess={(userRole) => {
              setShowLoginModal(false);
              setCurrentNavView(userRole === 'guru' ? 'dashboard' : 'student_home');
            }}
          />
        ) : role === 'guru' ? (
          <TeacherDashboard />
        ) : role === 'siswa' ? (
          <StudentFlow />
        ) : (
          <LandingHero
            onLoginClick={(targetRole) => {
              setShowLoginModal(true);
            }}
          />
        )}
      </main>

      {/* Global Minimal Footer */}
      {!isInActiveExam && (
        <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-900">Kasturi Asesmen Digital</span>
              <span aria-hidden="true">·</span>
              <span>Sistem Ujian Berbasis Komputer & Kiosk Aman</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <span>Privasi Terlindungi: Tanpa Akses Kamera / Mikrofon</span>
              <span aria-hidden="true">·</span>
              <span>Standar Kurikulum Merdeka</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ExamProvider>
      <MainApp />
    </ExamProvider>
  );
}
