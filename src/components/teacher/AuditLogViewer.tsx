/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useExam } from '../../context/ExamContext';
import { ViolationType } from '../../types/exam';
import { 
  ShieldAlert, 
  Clock, 
  User, 
  Filter, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Monitor,
  ExternalLink
} from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { sessions, exams } = useExam();
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Flatten all violation logs from all sessions with student info
  const allLogs = useMemo(() => {
    const list: Array<{
      logId: string;
      timestamp: number;
      timeFormatted: string;
      type: ViolationType;
      title: string;
      description: string;
      studentName: string;
      studentNisn: string;
      studentClass: string;
      examTitle: string;
      sessionId: string;
    }> = [];

    sessions.forEach((sess) => {
      const exam = exams.find((e) => e.id === sess.examId);
      sess.violations.forEach((v) => {
        list.push({
          logId: v.id,
          timestamp: v.timestamp,
          timeFormatted: v.timeFormatted,
          type: v.type,
          title: v.title,
          description: v.description,
          studentName: sess.student.name,
          studentNisn: sess.student.nisn,
          studentClass: sess.student.classGrade,
          examTitle: exam?.title || 'Asesmen',
          sessionId: sess.id,
        });
      });
    });

    // Sort descending by timestamp
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [sessions, exams]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      if (selectedStudentFilter !== 'all' && log.studentNisn !== selectedStudentFilter) {
        return false;
      }
      if (selectedTypeFilter !== 'all' && log.type !== selectedTypeFilter) {
        return false;
      }
      return true;
    });
  }, [allLogs, selectedStudentFilter, selectedTypeFilter]);

  // Unique students for filter
  const uniqueStudents = useMemo(() => {
    const map = new Map<string, string>();
    allLogs.forEach((l) => map.set(l.studentNisn, l.studentName));
    return Array.from(map.entries());
  }, [allLogs]);

  const renderBadge = (type: ViolationType) => {
    switch (type) {
      case 'TAB_SWITCH':
        return <span className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded text-[11px]">Beralih Tab</span>;
      case 'WINDOW_BLUR':
        return <span className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded text-[11px]">Kehilangan Fokus</span>;
      case 'FULLSCREEN_EXIT':
        return <span className="bg-orange-100 text-orange-900 font-semibold px-2 py-0.5 rounded text-[11px]">Keluar Fullscreen</span>;
      case 'KEY_SHORTCUT':
        return <span className="bg-purple-100 text-purple-900 font-semibold px-2 py-0.5 rounded text-[11px]">Tombol Pintas / Salin</span>;
      case 'SUSPENDED':
        return <span className="bg-red-100 text-red-900 font-bold px-2 py-0.5 rounded text-[11px]">Ujian Ditangguhkan</span>;
      case 'UNLOCKED_BY_TEACHER':
        return <span className="bg-emerald-100 text-emerald-900 font-semibold px-2 py-0.5 rounded text-[11px]">Dibuka Pengawas</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px]">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Row */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-700" />
            <span>Audit Log & Jejak Keamanan Integritas Kiosk</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan detik demi detik saat siswa beralih tab, keluar layar penuh, atau kehilangan fokus jendela ujian.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Semua Siswa ({allLogs.length})</option>
            {uniqueStudents.map(([nisn, name]) => (
              <option key={nisn} value={nisn}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Semua Jenis Log</option>
            <option value="TAB_SWITCH">Perpindahan Tab</option>
            <option value="FULLSCREEN_EXIT">Keluar Layar Penuh</option>
            <option value="WINDOW_BLUR">Fokus Hilang</option>
            <option value="KEY_SHORTCUT">Tombol Pintas / Salin</option>
            <option value="SUSPENDED">Ujian Ditangguhkan</option>
            <option value="UNLOCKED_BY_TEACHER">Buka Kunci Guru</option>
          </select>
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">Nama Siswa / NISN</th>
                <th className="py-3 px-4">Jenis Peristiwa</th>
                <th className="py-3 px-4">Deskripsi Audit Terperinci</th>
                <th className="py-3 px-4">Ujian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    Belum ada catatan pelanggaran yang terdeteksi. Sistem berjalan tertib.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.logId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                      {log.timeFormatted}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{log.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">NISN: {log.studentNisn}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderBadge(log.type)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-md">
                      <div className="font-semibold text-slate-900 mb-0.5">{log.title}</div>
                      <div className="text-[11px] text-slate-500">{log.description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap truncate max-w-xs">
                      {log.examTitle}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
