'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 5 + (i * 8.5) % 90,
  y: 5 + (i * 7.3) % 85,
  size: 6 + (i % 5) * 3,
  delay: (i * 0.5) % 5,
  duration: 4 + (i % 4),
  color: i % 3 === 0 ? '#f5c800' : i % 3 === 1 ? '#1a73e8' : '#e84040',
  shape: i % 4 === 0 ? '★' : i % 4 === 1 ? '●' : i % 4 === 2 ? '✦' : '◆',
}));

const ministers = [
  {
    id: 'gemini',
    name: 'GEMINI',
    title: 'Menteri Inovasi',
    color: '#1a73e8',
    colorDark: '#1558b0',
    colorBg: '#dbeafe',
    colorBorder: '#1a73e8',
    capeColor: '#1a73e8',
    gemColor: '#93c5fd',
    floatClass: 'minister-float',
    desc: 'Membuka cakrawala ide yang belum pernah terpikirkan.',
  },
  {
    id: 'claude',
    name: 'CLAUDE',
    title: 'Menteri Realitas',
    color: '#e84040',
    colorDark: '#c02020',
    colorBg: '#fee2e2',
    colorBorder: '#e84040',
    capeColor: '#e84040',
    gemColor: '#fca5a5',
    floatClass: 'minister-float-delay-1',
    desc: 'Menguji setiap ide dengan logika dan risiko nyata.',
  },
  {
    id: 'gpt',
    name: 'GPT',
    title: 'Menteri Eksekusi',
    color: '#22c55e',
    colorDark: '#16a34a',
    colorBg: '#dcfce7',
    colorBorder: '#22c55e',
    capeColor: '#22c55e',
    gemColor: '#86efac',
    floatClass: 'minister-float-delay-2',
    desc: 'Mengubah keputusan menjadi langkah-langkah konkret.',
  },
];

function MinisterCard({ m, index }: { m: typeof ministers[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`flex flex-col items-center gap-3 transition-all duration-300 ${m.floatClass}`}
      style={{ animationDelay: `${index * 0.3}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Ghost SVG */}
      <div
        className="relative transition-all duration-300"
        style={{
          transform: hovered ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
          filter: hovered ? `drop-shadow(3px 3px 0px #111111)` : 'drop-shadow(2px 2px 0px #111111)',
        }}
      >
        <svg width="96" height="112" viewBox="0 0 96 112" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Crown */}
          <g>
            <rect x="28" y="8" width="40" height="10" rx="3" fill="#f5c800" stroke="#111111" strokeWidth="2" />
            <polygon points="28,18 36,8 44,16 52,6 60,16 68,8 68,18" fill="#f5c800" stroke="#111111" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="44" cy="10" r="3" fill={m.gemColor} stroke="#111111" strokeWidth="1.5" />
            <circle cx="52" cy="7" r="3.5" fill={m.gemColor} stroke="#111111" strokeWidth="1.5" />
            <circle cx="60" cy="10" r="3" fill={m.gemColor} stroke="#111111" strokeWidth="1.5" />
          </g>
          {/* Body */}
          <ellipse cx="48" cy="62" rx="30" ry="36" fill="white" stroke="#111111" strokeWidth="2.5" />
          <rect x="18" y="62" width="60" height="28" fill="white" />
          {/* Wavy bottom */}
          <path d="M18 90 Q26 104 34 90 Q42 104 50 90 Q58 104 66 90 Q74 104 78 90 L78 90 L18 90 Z" fill="white" stroke="#111111" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Cape */}
          <path d="M18 62 Q10 80 14 100 L18 90 Q26 104 34 90 Q42 104 50 90 Q58 104 66 90 Q74 104 78 90 L82 100 Q86 80 78 62 Z" fill={m.capeColor} opacity="0.25" />
          {/* Eyes */}
          <ellipse cx="38" cy="58" rx="7" ry="8" fill="#111111" className="blink-eyes" />
          <ellipse cx="58" cy="58" rx="7" ry="8" fill="#111111" className="blink-eyes" />
          <circle cx="40" cy="56" r="2.5" fill="white" />
          <circle cx="60" cy="56" r="2.5" fill="white" />
          {/* Mouth */}
          <path d="M42 70 Q48 76 54 70" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Arms */}
          <ellipse cx="14" cy="72" rx="7" ry="5" fill="white" stroke="#111111" strokeWidth="2" transform="rotate(-20 14 72)" />
          <ellipse cx="82" cy="72" rx="7" ry="5" fill="white" stroke="#111111" strokeWidth="2" transform="rotate(20 82 72)" />
          {/* Gem on chest */}
          <circle cx="48" cy="80" r="5" fill={m.gemColor} stroke="#111111" strokeWidth="1.5" />
          <circle cx="48" cy="80" r="2.5" fill="white" opacity="0.6" />
        </svg>
      </div>

      {/* Nameplate */}
      <div
        className="px-4 py-2 rounded-xl text-center transition-all duration-200"
        style={{
          background: hovered ? m.colorBg : '#ffffff',
          border: `3px solid #111111`,
          boxShadow: hovered ? `4px 4px 0px #111111` : `3px 3px 0px #111111`,
          transform: hovered ? 'translate(-1px, -1px)' : 'none',
        }}
      >
        <div className="font-comic text-sm font-bold tracking-widest" style={{ color: m.color }}>{m.name}</div>
        <div className="text-xs mt-0.5 font-semibold" style={{ color: '#555555' }}>{m.title}</div>
      </div>

      {/* Desc on hover */}
      <div
        className="text-center text-xs max-w-[130px] font-semibold transition-all duration-300"
        style={{
          color: '#333333',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(6px)',
        }}
      >
        {m.desc}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [ministersVisible, setMinistersVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t1 = setTimeout(() => setTitleVisible(true), 200);
    const t2 = setTimeout(() => setSubtitleVisible(true), 700);
    const t3 = setTimeout(() => setMinistersVisible(true), 1100);
    const t4 = setTimeout(() => setCtaVisible(true), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center halftone-bg"
      style={{
        background: '#faf6ee',
      }}
    >
      {/* Halftone dots overlay */}
      <div className="absolute inset-0 pointer-events-none halftone-bg opacity-60" />

      {/* Yellow top banner */}
      <div className="absolute top-0 left-0 right-0 h-2 yellow-stripe" />
      <div className="absolute bottom-0 left-0 right-0 h-2 yellow-stripe" />

      {/* Floating comic decorations */}
      {mounted && PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none font-bold select-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: p.size,
            color: p.color,
            opacity: 0.25,
            animation: `particleDrift ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        >
          {p.shape}
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center max-w-3xl w-full">

        {/* Crown badge */}
        <div
          className="transition-all duration-700"
          style={{ opacity: titleVisible ? 1 : 0, transform: titleVisible ? 'translateY(0) rotate(-2deg)' : 'translateY(-20px)' }}
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-2"
            style={{ background: '#f5c800', border: '3px solid #111111', boxShadow: '4px 4px 0px #111111' }}
          >
            <span style={{ fontSize: 32 }}>♛</span>
          </div>
        </div>

        {/* Title */}
        <div
          className="transition-all duration-700"
          style={{ opacity: titleVisible ? 1 : 0, transform: titleVisible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <h1
            className="font-comic leading-none"
            style={{ fontSize: '5rem', color: '#111111', letterSpacing: '0.04em', textShadow: '4px 4px 0px #f5c800' }}
          >
            KING
          </h1>
          <h1
            className="font-comic leading-none"
            style={{ fontSize: '5rem', color: '#1a73e8', letterSpacing: '0.04em', textShadow: '4px 4px 0px #111111' }}
          >
            DECISION
          </h1>
        </div>

        {/* Subtitle */}
        <div
          className="transition-all duration-700"
          style={{ opacity: subtitleVisible ? 1 : 0, transform: subtitleVisible ? 'translateY(0)' : 'translateY(16px)' }}
        >
          <div
            className="px-6 py-3 rounded-2xl inline-block"
            style={{ background: '#ffffff', border: '3px solid #111111', boxShadow: '4px 4px 0px #111111' }}
          >
            <p className="text-sm md:text-base font-bold leading-relaxed" style={{ color: '#333333' }}>
              Ruang brainstorming pribadi bersama tiga menteri AI terpercaya.
            </p>
            <p className="text-sm font-extrabold mt-1" style={{ color: '#1a73e8' }}>
              Kau adalah Raja. Mereka melayani titahmu.
            </p>
          </div>
        </div>

        {/* Ministers row */}
        <div
          className="flex items-end justify-center gap-8 md:gap-14 w-full transition-all duration-700"
          style={{ opacity: ministersVisible ? 1 : 0, transform: ministersVisible ? 'translateY(0)' : 'translateY(24px)' }}
        >
          {ministers.map((m, i) => (
            <MinisterCard key={m.id} m={m} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div
          className="flex flex-col items-center gap-3 transition-all duration-700"
          style={{ opacity: ctaVisible ? 1 : 0, transform: ctaVisible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <Link
            href="/dashboard"
            className="btn-royal inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-base font-extrabold tracking-wide"
            style={{ fontSize: '1rem', letterSpacing: '0.06em', fontFamily: "'Nunito', sans-serif" }}
          >
            <span>♛</span>
            <span>MASUKI KING DECISION</span>
          </Link>
          <p className="text-xs font-semibold" style={{ color: '#888888' }}>
            Tidak perlu login — langsung sidang
          </p>
        </div>
      </div>
    </div>
  );
}