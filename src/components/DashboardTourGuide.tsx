'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface TourStep {
  id: string;
  title: string;
  description: string;
  emoji: string;
  targetSelector?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  spotlightPadding?: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Selamat Datang di KING DECISION! 👑',
    description: 'Ini adalah ruang sidang keputusan Anda. Kami akan memandu Anda mengenal semua fitur utama. Ikuti tur singkat ini!',
    emoji: '♛',
    position: 'center',
  },
  {
    id: 'navbar',
    title: 'Navbar — Kendali Utama',
    description: 'Navbar di bagian atas berisi tombol toggle sidebar, logo King Decision, label halaman aktif, dan tombol profil raja di pojok kanan.',
    emoji: '🔝',
    targetSelector: 'header',
    position: 'bottom',
    spotlightPadding: 6,
  },
  {
    id: 'sidebar-toggle',
    title: 'Toggle Sidebar',
    description: 'Tombol ini membuka atau menutup sidebar. Klik untuk memperluas atau menyembunyikan menu navigasi di sebelah kiri.',
    emoji: '☰',
    targetSelector: '[data-tour="sidebar-toggle"]',
    position: 'right',
    spotlightPadding: 8,
  },
  {
    id: 'sidebar',
    title: 'Sidebar — Navigasi Kerajaan',
    description: 'Sidebar berisi menu navigasi utama: Sidang Saat Ini, Riwayat Sidang, Profil Raja, dan Pengaturan. Klik ikon chevron untuk collapse.',
    emoji: '📋',
    targetSelector: 'aside',
    position: 'right',
    spotlightPadding: 6,
  },
  {
    id: 'profile',
    title: 'Profil Raja',
    description: 'Klik ikon mahkota ♛ di pojok kanan navbar atau di bagian bawah sidebar untuk mengatur profil, nama, dan tema tampilan Anda.',
    emoji: '👤',
    targetSelector: '[data-tour="profile-btn"]',
    position: 'left',
    spotlightPadding: 8,
  },
  {
    id: 'call-minister',
    title: 'Panggil Para Menteri',
    description: 'Gunakan tombol Gemini ✦, Claude ◈, dan GPT ⬡ untuk memanggil menteri secara langsung. Setiap menteri punya keahlian berbeda!',
    emoji: '📣',
    targetSelector: '[data-tour="call-minister"]',
    position: 'top',
    spotlightPadding: 8,
  },
  {
    id: 'attachment',
    title: 'Upload Media & Lampiran',
    description: 'Lampirkan file, gambar, PDF, atau dokumen agar para menteri bisa menganalisis dan memberikan pendapat berdasarkan konten file Anda.',
    emoji: '📎',
    targetSelector: '[data-tour="attachment-area"]',
    position: 'top',
    spotlightPadding: 8,
  },
  {
    id: 'chatbox',
    title: 'Kotak Chat — Ajukan Ide',
    description: 'Ketik ide, pertanyaan, atau topik keputusan di sini. Tekan Enter atau klik kirim untuk memulai sidang dengan para menteri AI.',
    emoji: '💬',
    targetSelector: '[data-tour="chatbox"]',
    position: 'top',
    spotlightPadding: 8,
  },
  {
    id: 'debate-btn',
    title: 'Mulai Debat Menteri',
    description: 'Setelah mengirim topik, klik tombol "Mulai Debat" untuk membiarkan para menteri berdiskusi dan berdebat secara otomatis.',
    emoji: '⚔️',
    targetSelector: '[data-tour="debate-btn"]',
    position: 'top',
    spotlightPadding: 8,
  },
  {
    id: 'done',
    title: 'Siap Memimpin! 🎉',
    description: 'Anda sudah mengenal semua fitur utama King Decision. Ajukan ide pertama Anda dan biarkan para menteri bekerja untuk Anda!',
    emoji: '🚀',
    position: 'center',
  },
];

const SESSION_KEY = 'king_decision_tour_done';

export default function DashboardTourGuide() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, transform: '' });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Check session — show tour if not done this session
  useEffect(() => {
    const done = sessionStorage.getItem(SESSION_KEY);
    if (!done) {
      // Small delay so DOM is ready
      const t = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const getTargetRect = useCallback((selector?: string): DOMRect | null => {
    if (!selector) return null;
    const el = document.querySelector(selector);
    if (!el) return null;
    return el.getBoundingClientRect();
  }, []);

  const computeTooltipPosition = useCallback(
    (rect: DOMRect | null, position: TourStep['position'], padding = 8) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const tooltipW = Math.min(320, vw - 32);
      const tooltipH = 200; // approximate

      if (!rect || position === 'center') {
        return {
          top: vh / 2 - tooltipH / 2,
          left: vw / 2 - tooltipW / 2,
          transform: '',
        };
      }

      let top = 0;
      let left = 0;

      switch (position) {
        case 'bottom':
          top = rect.bottom + padding + 12;
          left = rect.left + rect.width / 2 - tooltipW / 2;
          break;
        case 'top':
          top = rect.top - tooltipH - padding - 12;
          left = rect.left + rect.width / 2 - tooltipW / 2;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipH / 2;
          left = rect.right + padding + 12;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipH / 2;
          left = rect.left - tooltipW - padding - 12;
          break;
      }

      // Clamp within viewport
      left = Math.max(12, Math.min(left, vw - tooltipW - 12));
      top = Math.max(12, Math.min(top, vh - tooltipH - 12));

      return { top, left, transform: '' };
    },
    []
  );

  // Update spotlight + tooltip position on step change
  useEffect(() => {
    if (!isVisible) return;

    const step = TOUR_STEPS[currentStep];

    const update = () => {
      const rect = getTargetRect(step.targetSelector);
      setSpotlightRect(rect);
      const pos = computeTooltipPosition(rect, step.position, step.spotlightPadding);
      setTooltipPos(pos);
    };

    update();

    // Scroll target into view
    if (step.targetSelector) {
      const el = document.querySelector(step.targetSelector);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Recompute on resize
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [currentStep, isVisible, getTargetRect, computeTooltipPosition]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleFinish = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setIsVisible(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const handleSkip = () => {
    handleFinish();
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const pad = step.spotlightPadding ?? 8;

  return (
    <>
      {/* Overlay with spotlight cutout */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{ isolation: 'isolate' }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)' }} />

        {/* Spotlight hole */}
        {spotlightRect && (
          <div
            className="absolute rounded-xl transition-all duration-300"
            style={{
              top: spotlightRect.top - pad,
              left: spotlightRect.left - pad,
              width: spotlightRect.width + pad * 2,
              height: spotlightRect.height + pad * 2,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
              background: 'transparent',
              border: '2.5px solid var(--primary)',
              zIndex: 1,
            }}
          />
        )}
      </div>

      {/* Click blocker for overlay (allows tooltip interaction) */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={handleNext}
        style={{ cursor: 'pointer' }}
      />

      {/* Tooltip Card */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] pointer-events-auto"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: 'min(320px, calc(100vw - 24px))',
          transform: tooltipPos.transform,
          transition: 'top 0.25s ease, left 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--background)',
            border: '3px solid var(--border)',
            boxShadow: '4px 4px 0px var(--border)',
          }}
        >
          {/* Header */}
          <div
            className="px-4 pt-4 pb-3 flex items-start gap-3"
            style={{ borderBottom: '2px solid var(--muted)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'var(--primary)', border: '2px solid var(--border)' }}
            >
              {step.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-sm leading-tight" style={{ color: 'var(--foreground)' }}>
                {step.title}
              </h3>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                Langkah {currentStep + 1} dari {TOUR_STEPS.length}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
              title="Lewati tur"
            >
              <Icon name="XMarkIcon" size={14} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1.5" style={{ background: 'var(--muted)' }}>
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, background: 'var(--primary)' }}
            />
          </div>

          {/* Body */}
          <div className="px-4 py-3">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
              {step.description}
            </p>
          </div>

          {/* Step dots */}
          <div className="px-4 pb-1 flex items-center justify-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === currentStep ? 20 : 8,
                  height: 8,
                  background: i === currentStep ? 'var(--primary)' : 'var(--muted)',
                  border: '1.5px solid var(--border)',
                }}
              />
            ))}
          </div>

          {/* Footer buttons */}
          <div className="px-4 pb-4 pt-2 flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'var(--muted)',
                  border: '2px solid var(--border)',
                  boxShadow: '2px 2px 0px var(--border)',
                  color: 'var(--muted-foreground)',
                }}
              >
                ← Kembali
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'var(--primary)',
                border: '2px solid var(--border)',
                boxShadow: '2px 2px 0px var(--border)',
                color: 'var(--primary-foreground)',
              }}
            >
              {isLast ? '🎉 Mulai Sidang!' : 'Lanjut →'}
            </button>
          </div>

          {/* Skip hint */}
          {!isLast && (
            <div className="px-4 pb-3 text-center">
              <button
                onClick={handleSkip}
                className="text-[10px] font-semibold underline transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Lewati tur ini
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
