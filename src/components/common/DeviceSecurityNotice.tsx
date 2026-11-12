/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, Info, X } from 'lucide-react';

export const DeviceSecurityNotice: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside 
      aria-label="Catatan Keamanan Sistem"
      className="bg-sky-50 border-b border-sky-100 text-sky-950 px-4 py-2.5 text-xs transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-sky-600 shrink-0" aria-hidden="true" />
          <p className="leading-snug">
            <strong className="font-semibold text-sky-900">Catatan Standar Keamanan Asesmen:</strong>{' '}
            Web browser modern menyediakan pengawasan tab & layar penuh, namun tidak dapat menjamin penguncian perangkat 100%. Untuk ujian berintegritas tinggi tingkat dinas/sekolah, kombinasikan dengan <em>Kiosk Mode OS</em>, <em>Safe Exam Browser (SEB)</em>, atau Chromebook terkelola.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-sky-700 hover:text-sky-950 p-1 rounded hover:bg-sky-100/60 transition-colors shrink-0"
          aria-label="Tutup pemberitahuan keamanan"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
