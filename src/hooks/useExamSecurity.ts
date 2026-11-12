/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useExam } from '../context/ExamContext';

interface UseExamSecurityOptions {
  enabled: boolean;
  isSuspended: boolean;
  isCompleted: boolean;
  maxViolations: number;
}

export function useExamSecurity({
  enabled,
  isSuspended,
  isCompleted,
  maxViolations,
}: UseExamSecurityOptions) {
  const { recordViolation } = useExam();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const isGracePeriodRef = useRef<boolean>(true);
  const lastEventTimeRef = useRef<number>(0);

  // Helper to enter fullscreen
  const requestFullscreen = useCallback(async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if ((docEl as any).webkitRequestFullscreen) {
        await (docEl as any).webkitRequestFullscreen();
      } else if ((docEl as any).msRequestFullscreen) {
        await (docEl as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.warn('Fullscreen request denied or not supported in this frame:', err);
    }
  }, []);

  // Helper to exit fullscreen gracefully when exam finishes
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
  }, []);

  // Grace period when component mounts to avoid false positive triggers during fullscreen switch
  useEffect(() => {
    if (!enabled || isCompleted) return;
    
    isGracePeriodRef.current = true;
    const timer = setTimeout(() => {
      isGracePeriodRef.current = false;
    }, 2000);

    return () => clearTimeout(timer);
  }, [enabled, isCompleted]);

  // Fullscreen tracking & detection
  useEffect(() => {
    if (!enabled || isCompleted) return;

    const handleFullscreenChange = () => {
      const activeFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(activeFs);

      if (!activeFs && !isGracePeriodRef.current && !isSuspended) {
        const now = Date.now();
        if (now - lastEventTimeRef.current > 1200) {
          lastEventTimeRef.current = now;
          recordViolation(
            'FULLSCREEN_EXIT',
            'Keluar dari Mode Layar Penuh',
            'Siswa terdeteksi keluar dari tampilan fullscreen (layar penuh) ujian.'
          );
          setWarningMessage(
            'Terdeteksi aktivitas meninggalkan layar penuh ujian. Silakan kembali ke mode layar penuh!'
          );
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [enabled, isCompleted, isSuspended, recordViolation]);

  // Page Visibility & Window Blur Detection
  useEffect(() => {
    if (!enabled || isCompleted || isSuspended) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !isGracePeriodRef.current) {
        const now = Date.now();
        if (now - lastEventTimeRef.current > 1200) {
          lastEventTimeRef.current = now;
          recordViolation(
            'TAB_SWITCH',
            'Perpindahan Tab / Aplikasi Terdeteksi',
            'Siswa terdeteksi berpindah tab browser atau me-minimize jendela ujian.'
          );
          setWarningMessage(
            'Terdeteksi aktivitas meninggalkan halaman ujian. Silakan kembali ke ujian!'
          );
        }
      }
    };

    const handleWindowBlur = () => {
      if (!isGracePeriodRef.current) {
        const now = Date.now();
        if (now - lastEventTimeRef.current > 1200) {
          lastEventTimeRef.current = now;
          recordViolation(
            'WINDOW_BLUR',
            'Fokus Layar Terputus',
            'Jendela browser kehilangan fokus (terindikasi membuka aplikasi eksternal, split window, atau notifikasi).'
          );
          setWarningMessage(
            'Terdeteksi aktivitas di luar jendela ujian. Harap tetap fokus pada halaman ujian!'
          );
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [enabled, isCompleted, isSuspended, recordViolation]);

  // Key Shortcut & Context Menu Protection
  useEffect(() => {
    if (!enabled || isCompleted) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordViolation(
        'CONTEXT_MENU',
        'Akses Menu Klik Kanan Diblokir',
        'Siswa mencoba membuka klik kanan (context menu / inspeksi elemen).'
      );
      setWarningMessage('Klik kanan dinonaktifkan demi keamanan ujian.');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept Developer Tools shortcuts: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      const isDevTools =
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u'));

      // Intercept Copy-Paste shortcuts: Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A
      const isClipboard =
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || e.key === 'x' || e.key === 'X');

      // Intercept reload attempts: F5, Ctrl+R
      const isReload = e.key === 'F5' || ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'));

      // Intercept new window / tab: Ctrl+N, Ctrl+T, Ctrl+W
      const isNewTabOrClose =
        (e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'N' || e.key === 't' || e.key === 'T' || e.key === 'w' || e.key === 'W');

      if (isDevTools || isClipboard || isReload || isNewTabOrClose) {
        e.preventDefault();
        e.stopPropagation();

        const now = Date.now();
        if (now - lastEventTimeRef.current > 1200) {
          lastEventTimeRef.current = now;
          const shortcutName = `${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`;
          recordViolation(
            'KEY_SHORTCUT',
            'Pencegahan Tombol Pintas / Salin Jawaban',
            `Kombinasi tombol pintas [${shortcutName}] diblokir oleh sistem ujian.`
          );
          setWarningMessage(
            `Kombinasi tombol pintas (${shortcutName}) diblokir demi keamanan ujian.`
          );
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isCompleted) {
        e.preventDefault();
        e.returnValue = 'Ujian sedang berlangsung! Jawaban Anda tersimpan otomatis.';
        return e.returnValue;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, isCompleted, recordViolation]);

  return {
    isFullscreen,
    requestFullscreen,
    exitFullscreen,
    warningMessage,
    clearWarningMessage: () => setWarningMessage(null),
  };
}
