'use client';

import React, { useState } from 'react';
import type { VerdictData, SessionPhase } from './CouncilSessionScreen';
import { useLanguage } from '@/components/LanguageProvider';

interface CouncilVerdictProps {
  verdict: VerdictData;
  onDecision: (decision: 'setujui' | 'ubah' | 'lanjut') => void;
  phase: SessionPhase;
}

export default function CouncilVerdict({
  verdict,
  onDecision,
  phase,
}: CouncilVerdictProps) {
  const { t } = useLanguage();
  const [decided, setDecided] = useState(false);

  const handleDecision = (d: 'setujui' | 'ubah' | 'lanjut') => {
    setDecided(true);
    onDecision(d);
  };

  const sections = [
    {
      key: 'kesimpulan',
      label: t.verdictConclusion,
      color: '#1a73e8',
      bg: '#dbeafe',
      icon: '◈',
      text: verdict.kesimpulan,
    },
    {
      key: 'risiko',
      label: t.verdictRisk,
      color: '#e84040',
      bg: '#fee2e2',
      icon: '⚠',
      text: verdict.risiko,
    },
    {
      key: 'peluang',
      label: t.verdictOpportunity,
      color: '#16a34a',
      bg: '#dcfce7',
      icon: '◆',
      text: verdict.peluang,
    },
    {
      key: 'rekomendasi',
      label: t.verdictRecommendation,
      color: '#111111',
      bg: '#f5c800',
      icon: '♛',
      text: verdict.rekomendasi,
    },
  ];

  return (
    <div className="px-3 py-3">
      {/* Verdict header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-0.5 flex-1" style={{ background: '#111111' }} />
        <span
          className="text-[9px] font-extrabold tracking-[0.15em] uppercase px-2 py-0.5 rounded"
          style={{ background: '#f5c800', border: '1.5px solid #111111', color: '#111111' }}
        >
          {t.verdictCouncil}
        </span>
        <div className="h-0.5 flex-1" style={{ background: '#111111' }} />
      </div>

      {/* Verdict sections */}
      <div className="space-y-2 mb-3">
        {sections.map((s) => (
          <div
            key={`verdict-${s.key}`}
            className="rounded-xl p-2.5"
            style={{
              background: s.bg,
              border: `2px solid #111111`,
              boxShadow: '2px 2px 0px #111111',
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-bold" style={{ color: s.color }}>
                {s.icon}
              </span>
              <span
                className="text-[9px] font-extrabold tracking-wide uppercase"
                style={{ color: s.color }}
              >
                {s.label}
              </span>
            </div>
            <p className="text-[10px] leading-relaxed font-semibold" style={{ color: '#333333' }}>
              {s.text}
            </p>
          </div>
        ))}
      </div>

      {/* Decision section */}
      {!decided && (
        <div>
          <div className="text-[9px] font-extrabold tracking-[0.12em] uppercase mb-2" style={{ color: '#555555' }}>
            {t.kingDecision}
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => handleDecision('setujui')}
              className="w-full py-2 px-3 rounded-xl text-[11px] font-extrabold btn-royal transition-all duration-150 cursor-pointer"
            >
              {t.approveDecision}
            </button>
            <button
              onClick={() => handleDecision('ubah')}
              className="w-full py-2 px-3 rounded-xl text-[11px] font-bold btn-ghost-royal transition-all duration-150 cursor-pointer"
            >
              {t.changeDirection}
            </button>
            <button
              onClick={() => handleDecision('lanjut')}
              className="w-full py-2 px-3 rounded-xl text-[11px] font-bold transition-all duration-150 cursor-pointer"
              style={{
                background: '#f0ead8',
                border: '2px solid #111111',
                boxShadow: '2px 2px 0px #111111',
                color: '#555555',
              }}
            >
              {t.continueDebate}
            </button>
          </div>
        </div>
      )}

      {decided && (
        <div
          className="text-center py-2 rounded-xl text-[11px] font-extrabold"
          style={{
            background: '#f5c800',
            border: '2px solid #111111',
            boxShadow: '3px 3px 0px #111111',
            color: '#111111',
          }}
        >
          {t.decisionMade}
        </div>
      )}
    </div>
  );
}