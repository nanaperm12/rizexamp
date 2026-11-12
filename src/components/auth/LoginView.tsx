/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { PRESET_STUDENTS, INITIAL_TEACHER } from '../../data/initialData';
import { StudentUser } from '../../types/exam';
import { 
  GraduationCap, 
  UserCheck, 
  KeyRound, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  School,
  Sparkles
} from 'lucide-react';

interface LoginViewProps {
  onSuccess: (role: 'guru' | 'siswa') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { loginTeacher, loginStudent } = useExam();
  const [activeTab, setActiveTab] = useState<'siswa' | 'guru'>('siswa');

  // Student manual input state
  const [studentNisn, setStudentNisn] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('X Teknik Komputer 1');
  const [studentError, setStudentError] = useState('');

  // Teacher input state
  const [teacherEmail, setTeacherEmail] = useState(INITIAL_TEACHER.email);
  const [teacherPassword, setTeacherPassword] = useState('guru123');
  const [teacherError, setTeacherError] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNisn.trim() || !studentName.trim()) {
      setStudentError('Harap lengkapi NISN dan Nama Lengkap peserta!');
      return;
    }

    const student: StudentUser = {
      id: `siswa-${studentNisn.trim()}`,
      nisn: studentNisn.trim(),
      name: studentName.trim(),
      classGrade: studentClass.trim(),
      school: 'SMK Negeri 1 Surabaya',
    };

    loginStudent(student);
    onSuccess('siswa');
  };

  const handleSelectPresetStudent = (preset: StudentUser) => {
    loginStudent(preset);
    onSuccess('siswa');
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherEmail.trim() || !teacherPassword.trim()) {
      setTeacherError('Harap isi email/NIP dan kata sandi guru!');
      return;
    }
    // Simple validation for prototype
    loginTeacher();
    onSuccess('guru');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl">
        {/* Main Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header banner */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <School className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Portal Asesmen & Ulangan Digital
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/90">
                  SMK Negeri 1 Surabaya · Ujian Berbasis Komputer & Kiosk Aman
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Role Switcher */}
          <div className="p-1 bg-slate-100 border-b border-slate-200 grid grid-cols-2">
            <button
              onClick={() => setActiveTab('siswa')}
              className={`py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'siswa'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-700" />
              <span>Masuk Sebagai Siswa</span>
            </button>
            <button
              onClick={() => setActiveTab('guru')}
              className={`py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'guru'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-700" />
              <span>Portal Guru / Pengawas</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'siswa' ? (
              <div>
                {/* Fast Preset Picker for convenient testing */}
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Pilih Cepat Akun Uji Coba Siswa:
                    </span>
                    <span className="text-[11px] text-blue-600 font-medium">1-Klik Langsung Masuk</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {PRESET_STUDENTS.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleSelectPresetStudent(st)}
                        className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-xs group"
                      >
                        <div className="font-semibold text-slate-900 group-hover:text-blue-900 truncate">
                          {st.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">NISN: {st.nisn}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div className="text-xs text-slate-500">Atau masukkan identitas siswa manual:</div>

                  {studentError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                      {studentError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nomor Induk Siswa Nasional (NISN)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 0067823910"
                      value={studentNisn}
                      onChange={(e) => setStudentNisn(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nama Lengkap Peserta
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap siswa"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Kelas / Rombongan Belajar
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: X TKJ 1 / XI RPL 2"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Masuk ke Halaman Ujian</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <div className="mb-6 p-3.5 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Akses Terotentikasi Guru:</strong>
                    <p className="mt-0.5 text-blue-800/90">
                      Kelola bank soal, jadwal ujian, KKM, toleransi pelanggaran, PIN guru unlock, rekapitulasi nilai, serta audit log kecurangan real-time.
                    </p>
                  </div>
                </div>

                {teacherError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                    {teacherError}
                  </div>
                )}

                <form onSubmit={handleTeacherSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email Kedinasan / NIP
                    </label>
                    <input
                      type="text"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Kata Sandi Guru
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Masuk ke Dashboard Guru</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Guru Terdaftar: {INITIAL_TEACHER.name}</span>
                  <span className="font-mono text-slate-400">PIN Unlock: 1234</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Feature Quick Summary */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-slate-500">
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="block font-semibold text-slate-800">Exam Mode Kiosk</span>
            <span className="text-[11px] text-slate-500">Layar Penuh Terkunci</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="block font-semibold text-slate-800">Autosave 100%</span>
            <span className="text-[11px] text-slate-500">Jawaban Tak Terhapus</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="block font-semibold text-slate-800">Audit Log Real-time</span>
            <span className="text-[11px] text-slate-500">Timestamp Pelanggaran</span>
          </div>
        </div>
      </div>
    </div>
  );
};
