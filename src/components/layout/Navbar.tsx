/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useExam } from '../../context/ExamContext';
import { LogOut, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { role, teacher, activeStudent, logout } = useExam();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="text-lg font-bold tracking-tight text-blue-900 hover:text-blue-800 transition-colors whitespace-nowrap shrink-0 text-left"
        >
          Kasturi Asesmen
        </button>

        {/* Zone 2: 4-5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {role === 'guru' ? (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'dashboard' ? 'text-blue-700 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Manajemen Ujian
              </button>
              <button
                onClick={() => onNavigate('questions')}
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'questions' ? 'text-blue-700 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Bank Soal
              </button>
              <button
                onClick={() => onNavigate('results')}
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'results' ? 'text-blue-700 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Hasil & Rekap
              </button>
              <button
                onClick={() => onNavigate('audit')}
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'audit' ? 'text-blue-700 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Audit Log
              </button>
              <button
                onClick={() => onNavigate('security')}
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'security' ? 'text-blue-700 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Keamanan Kiosk
              </button>
            </>
          ) : role === 'siswa' ? (
            <>
              <button
                onClick={() => onNavigate('student_home')}
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'student_home' ? 'text-blue-700 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Beranda Ujian
              </button>
              <button
                onClick={() => onNavigate('student_instructions')}
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'student_instructions' ? 'text-blue-700 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Tata Tertib
              </button>
              <button
                onClick={() => onNavigate('student_history')}
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'student_history' ? 'text-blue-700 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Riwayat Selesai
              </button>
            </>
          ) : (
            <>
              <a href="#fitur" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
                Fitur Kiosk
              </a>
              <a href="#alur" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
                Alur Asesmen
              </a>
              <a href="#keamanan" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
                Sistem Keamanan
              </a>
              <a href="#panduan" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
                Panduan ANBK/CBT
              </a>
            </>
          )}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {role ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs text-slate-500 font-mono">
                {role === 'guru' ? teacher.name.split(',')[0] : activeStudent?.name.split(' ')[0]}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                title="Keluar dari sesi"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              Masuk Portal Ujian
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
