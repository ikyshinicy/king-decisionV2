'use client';

import React, { useEffect, useRef } from 'react';
import MinisterCharacter from './MinisterCharacter';
import type { MinisterKey, MinisterState, SpeechBubble, SessionPhase } from './CouncilSessionScreen';

interface CouncilSceneProps {
  ministerStates: Record<MinisterKey, MinisterState>;
  speechBubbles: Record<MinisterKey, SpeechBubble>;
  phase: SessionPhase;
}

// Floating particles for ambient magic
const PARTICLES = [
  { id: 'p-1', x: '15%', y: '20%', size: 3, color: 'var(--gemini)', delay: 0 },
  { id: 'p-2', x: '80%', y: '25%', size: 2, color: 'var(--gpt)', delay: 1.5 },
  { id: 'p-3', x: '50%', y: '15%', size: 2, color: 'var(--gold)', delay: 0.8 },
  { id: 'p-4', x: '25%', y: '60%', size: 1.5, color: 'var(--gemini)', delay: 2.1 },
  { id: 'p-5', x: '75%', y: '55%', size: 2, color: 'var(--claude)', delay: 1.2 },
  { id: 'p-6', x: '60%', y: '70%', size: 1.5, color: 'var(--gold)', delay: 0.4 },
  { id: 'p-7', x: '10%', y: '45%', size: 2.5, color: 'var(--gpt)', delay: 1.8 },
  { id: 'p-8', x: '88%', y: '40%', size: 1.5, color: 'var(--gemini)', delay: 0.6 },
];

export default function CouncilScene({
  ministerStates,
  speechBubbles,
  phase,
}: CouncilSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={sceneRef}
      className="council-bg w-full h-full relative overflow-hidden"
      style={{ minHeight: '100vh' }}
    >
      {/* Halftone dots overlay */}
      <div className="absolute inset-0 pointer-events-none halftone-bg opacity-40" />

      {/* Floating comic decorations */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.x,
            top: p.y,
            width: `${p.size * 4}px`,
            height: `${p.size * 4}px`,
            background: p.color,
            opacity: 0.2,
            animationDelay: `${p.delay}s`,
            animationDuration: `${5 + p.delay}s`,
          }}
        />
      ))}

      {/* Scene title */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <div
          className="font-comic text-sm tracking-[0.2em] uppercase px-4 py-1 rounded-full"
          style={{ color: '#111111', background: '#f5c800', border: '2px solid #111111', boxShadow: '3px 3px 0px #111111' }}
        >
          ♛ KING DECISION ♛
        </div>
      </div>

      {/* Phase indicator */}
      {phase !== 'waiting' && (
        <div
          className="absolute top-5 right-5 flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{ background: '#ffffff', border: '2px solid #111111', boxShadow: '3px 3px 0px #111111' }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background:
                phase === 'decided' ? '#22c55e'
                  : phase === 'verdict-pending' ? '#f5c800' : '#e84040',
              border: '1.5px solid #111111',
              animation: phase !== 'decided' ? 'thinkingPulse 1s ease-in-out infinite' : 'none',
            }}
          />
          <span className="text-[10px] font-bold tracking-wide" style={{ color: '#333333' }}>
            {phase === 'decided' ? 'Sidang Selesai'
              : phase === 'verdict-pending' ? 'Verdik Siap'
              : phase === 'debating' ? 'Dewan Berdebat'
              : phase === 'gemini-speaking' ? 'Gemini Berbicara'
              : phase === 'claude-speaking' ? 'Claude Berbicara'
              : phase === 'gpt-speaking' ? 'GPT Berbicara' : 'Sidang Aktif'}
          </span>
        </div>
      )}

      {/* Main council area */}
      <div className="absolute inset-0 flex flex-col items-center justify-start pt-12">
        {/* Ministers row */}
        <div className="relative w-full flex items-end justify-center gap-0 px-8" style={{ height: '340px' }}>
          {/* Background arch / wall */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(22,27,58,0.6) 0%, transparent 70%)',
            }}
          />

          {/* Gemini — Left */}
          <div className="flex-1 flex justify-center items-end pb-4 relative">
            <MinisterCharacter
              minister="gemini"
              state={ministerStates.gemini}
              speechBubble={speechBubbles.gemini}
              floatClass="minister-float"
            />
          </div>

          {/* Claude — Center */}
          <div className="flex-1 flex justify-center items-end pb-8 relative z-10">
            <MinisterCharacter
              minister="claude"
              state={ministerStates.claude}
              speechBubble={speechBubbles.claude}
              floatClass="minister-float-delay-1"
            />
          </div>

          {/* GPT — Right */}
          <div className="flex-1 flex justify-center items-end pb-4 relative">
            <MinisterCharacter
              minister="gpt"
              state={ministerStates.gpt}
              speechBubble={speechBubbles.gpt}
              floatClass="minister-float-delay-2"
            />
          </div>
        </div>

        {/* Round Table */}
        <div className="table-perspective w-full flex justify-center" style={{ marginTop: '-20px' }}>
          <div className="table-3d w-full max-w-2xl">
            <RoundTable
              ministerStates={ministerStates}
              phase={phase}
            />
          </div>
        </div>

        {/* King's hands / foreground */}
        <div className="w-full flex justify-center mt-auto relative" style={{ marginTop: '-40px' }}>
          <KingForeground />
        </div>
      </div>
    </div>
  );
}

function RoundTable({
  ministerStates,
  phase,
}: {
  ministerStates: Record<MinisterKey, MinisterState>;
  phase: SessionPhase;
}) {
  return (
    <div className="relative w-full h-[180px] flex items-start justify-center">
      {/* Table surface */}
      <div
        className="absolute table-wood rounded-[50%] shadow-2xl"
        style={{
          width: '85%',
          height: '160px',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(139,94,60,0.3)',
        }}
      >
        {/* Table grain lines */}
        <div
          className="absolute inset-4 rounded-[50%] opacity-20"
          style={{
            background: 'repeating-radial-gradient(ellipse at center, transparent 0px, transparent 8px, rgba(0,0,0,0.15) 9px)',
          }}
        />
        {/* Center gold emblem */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-12 h-12 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: 'rgba(212,168,83,0.3)',
              background: 'rgba(212,168,83,0.05)',
            }}
          >
            <span className="text-gold/40 text-lg">♛</span>
          </div>
        </div>

        {/* Nameplates */}
        <div className="absolute inset-0 flex items-start justify-around pt-4 px-8">
          <Nameplate minister="gemini" label="GEMINI" subtitle="Menteri Inovasi" active={ministerStates.gemini === 'speaking'} />
          <Nameplate minister="claude" label="CLAUDE" subtitle="Menteri Realitas" active={ministerStates.claude === 'speaking'} />
          <Nameplate minister="gpt" label="GPT" subtitle="Menteri Eksekusi" active={ministerStates.gpt === 'speaking'} />
        </div>
      </div>

      {/* Table rim / edge */}
      <div
        className="absolute rounded-[50%]"
        style={{
          width: '85%',
          height: '170px',
          top: '5px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'transparent',
          border: '4px solid rgba(139,94,60,0.4)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          zIndex: -1,
        }}
      />
    </div>
  );
}

function Nameplate({
  minister,
  label,
  subtitle,
  active,
}: {
  minister: MinisterKey;
  label: string;
  subtitle: string;
  active: boolean;
}) {
  const colors: Record<MinisterKey, string> = {
    gemini: '#1a73e8',
    claude: '#e84040',
    gpt: '#22c55e',
  };

  return (
    <div
      className="flex flex-col items-center transition-all duration-300"
      style={{
        opacity: active ? 1 : 0.7,
        transform: active ? 'scale(1.08)' : 'scale(1)',
      }}
    >
      <div
        className="px-2.5 py-1 rounded-lg text-center"
        style={{
          background: active ? colors[minister] : '#ffffff',
          border: `2px solid #111111`,
          boxShadow: active ? `3px 3px 0px #111111` : `2px 2px 0px #111111`,
          transition: 'all 0.3s ease',
        }}
      >
        <div
          className="text-[9px] font-extrabold tracking-[0.15em]"
          style={{ color: active ? '#ffffff' : '#333333' }}
        >
          {label}
        </div>
        <div className="text-[7px] font-semibold tracking-wide mt-0.5" style={{ color: active ? 'rgba(255,255,255,0.8)' : '#888888' }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function KingForeground() {
  return (
    <div className="relative w-full max-w-3xl" style={{ height: '120px' }}>
      {/* Chair back */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: '280px',
          height: '80px',
          background: '#f5c800',
          borderTop: '3px solid #111111',
          borderLeft: '3px solid #111111',
          borderRight: '3px solid #111111',
          borderRadius: '60px 60px 0 0',
          boxShadow: '0 -4px 0 #111111',
        }}
      >
        {/* Chair decoration */}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 font-comic text-2xl"
          style={{ color: '#111111', opacity: 0.3 }}
        >
          ♛
        </div>
      </div>

      {/* King's hands on table */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-32">
        {/* Left hand */}
        <div
          style={{
            width: '50px',
            height: '28px',
            background: '#c8a060',
            borderRadius: '12px 12px 8px 8px',
            border: '2px solid #111111',
            boxShadow: '2px 2px 0px #111111',
            transform: 'rotate(-8deg)',
          }}
        />
        {/* Right hand */}
        <div
          style={{
            width: '50px',
            height: '28px',
            background: '#c8a060',
            borderRadius: '12px 12px 8px 8px',
            border: '2px solid #111111',
            boxShadow: '2px 2px 0px #111111',
            transform: 'rotate(8deg)',
          }}
        />
      </div>
    </div>
  );
}