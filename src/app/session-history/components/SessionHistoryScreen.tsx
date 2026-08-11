'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useLanguage } from '@/components/LanguageProvider';

type DecisionType = 'setujui' | 'ubah' | 'lanjut' | 'pending';

interface HistorySession {
  id: string;
  title: string;
  topic: string;
  date: string;
  time: string;
  roundCount: number;
  messageCount: number;
  decision: DecisionType;
  ministers: ('gemini' | 'claude' | 'gpt')[];
  verdictSnippet: string;
  tags: string[];
  duration: string;
}

const SESSIONS: HistorySession[] = [
  {
    id: 'sess-001',
    title: 'AI Catalog Tool',
    topic: 'Membangun tool katalog berbasis AI untuk UMKM Indonesia',
    date: '10 Agu 2026',
    time: '14:32',
    roundCount: 3,
    messageCount: 18,
    decision: 'setujui',
    ministers: ['gemini', 'claude', 'gpt'],
    verdictSnippet: 'Dewan sepakat: validasi pasar 30 hari, fokus segmen F&B, MVP dalam 60 hari.',
    tags: ['AI', 'UMKM', 'Katalog'],
    duration: '42 menit',
  },
  {
    id: 'sess-002',
    title: 'RanzAI Pricing Strategy',
    topic: 'Strategi harga freemium vs subscription untuk produk AI',
    date: '08 Agu 2026',
    time: '10:15',
    roundCount: 2,
    messageCount: 12,
    decision: 'ubah',
    ministers: ['gemini', 'claude', 'gpt'],
    verdictSnippet: 'Claude meminta evaluasi ulang: margin freemium terlalu tipis untuk skala Indonesia.',
    tags: ['Pricing', 'SaaS', 'Strategi'],
    duration: '28 menit',
  },
  {
    id: 'sess-003',
    title: 'Downloader MVP Scope',
    topic: 'Menentukan fitur inti MVP untuk aplikasi downloader multi-platform',
    date: '05 Agu 2026',
    time: '16:50',
    roundCount: 1,
    messageCount: 8,
    decision: 'setujui',
    ministers: ['gemini', 'gpt'],
    verdictSnippet: 'Fokus: YouTube + Instagram, tanpa login, export MP4/MP3. Launch dalam 14 hari.',
    tags: ['MVP', 'Mobile', 'Tools'],
    duration: '18 menit',
  },
  {
    id: 'sess-004',
    title: 'Strategi Produk Q4 2026',
    topic: 'Roadmap prioritas produk untuk kuartal 4 dengan 3 tim kecil',
    date: '01 Agu 2026',
    time: '09:00',
    roundCount: 4,
    messageCount: 24,
    decision: 'setujui',
    ministers: ['gemini', 'claude', 'gpt'],
    verdictSnippet: 'Prioritas: 1) AI Catalog, 2) RanzAI v2, 3) Downloader. Alokasi 40/35/25.',
    tags: ['Roadmap', 'Q4', 'Prioritas'],
    duration: '65 menit',
  },
  {
    id: 'sess-005',
    title: 'Brand Identity Refresh',
    topic: 'Memperbarui identitas brand untuk pasar B2B yang lebih matang',
    date: '28 Jul 2026',
    time: '11:20',
    roundCount: 2,
    messageCount: 14,
    decision: 'lanjut',
    ministers: ['gemini', 'claude'],
    verdictSnippet: 'Gemini dan Claude belum sepakat soal tone. Ronde lanjutan diperlukan.',
    tags: ['Branding', 'B2B', 'Design'],
    duration: '35 menit',
  },
  {
    id: 'sess-006',
    title: 'Monetisasi Komunitas Discord',
    topic: 'Model monetisasi untuk komunitas Discord 12.000 member',
    date: '24 Jul 2026',
    time: '20:05',
    roundCount: 2,
    messageCount: 11,
    decision: 'setujui',
    ministers: ['gemini', 'claude', 'gpt'],
    verdictSnippet: 'Membership tier: Free / Pro Rp49k / Masterclass Rp199k. Target MRR Rp15 juta.',
    tags: ['Komunitas', 'Monetisasi', 'Discord'],
    duration: '30 menit',
  },
  {
    id: 'sess-007',
    title: 'Partnership Strategi Go-To-Market',
    topic: 'Ekspansi melalui partnership dengan platform edukasi lokal',
    date: '20 Jul 2026',
    time: '13:45',
    roundCount: 3,
    messageCount: 16,
    decision: 'ubah',
    ministers: ['claude', 'gpt'],
    verdictSnippet: 'GPT: eksekusi terlalu kompleks untuk tim kecil. Ubah ke direct sales dulu.',
    tags: ['Partnership', 'GTM', 'Edukasi'],
    duration: '48 menit',
  },
  {
    id: 'sess-008',
    title: 'Tech Stack Pilihan 2026',
    topic: 'Memilih antara Next.js + Supabase vs Laravel + MySQL untuk proyek baru',
    date: '15 Jul 2026',
    time: '08:30',
    roundCount: 1,
    messageCount: 9,
    decision: 'setujui',
    ministers: ['gemini', 'gpt'],
    verdictSnippet: 'Next.js + Supabase menang: ekosistem lebih cepat, cocok untuk tim 2 orang.',
    tags: ['Tech', 'Stack', 'Development'],
    duration: '22 menit',
  },
  {
    id: 'sess-009',
    title: 'Ekspansi ke Pasar Malaysia',
    topic: 'Feasibility ekspansi produk digital ke pasar Malaysia dalam 6 bulan',
    date: '10 Jul 2026',
    time: '15:10',
    roundCount: 3,
    messageCount: 19,
    decision: 'pending',
    ministers: ['gemini', 'claude', 'gpt'],
    verdictSnippet: 'Debat masih berlangsung. Claude meminta riset tambahan tentang regulasi lokal.',
    tags: ['Ekspansi', 'Malaysia', 'Market'],
    duration: '52 menit',
  },
  {
    id: 'sess-010',
    title: 'Hiring Plan 2026',
    topic: 'Rencana rekrutmen: kapan waktu tepat hiring full-time vs kontrak',
    date: '05 Jul 2026',
    time: '10:00',
    roundCount: 2,
    messageCount: 13,
    decision: 'setujui',
    ministers: ['claude', 'gpt'],
    verdictSnippet: 'Hire 1 full-time dev + 2 kontrak. Evaluasi ulang di bulan ke-4 berdasarkan revenue.',
    tags: ['HR', 'Hiring', 'Tim'],
    duration: '38 menit',
  },
];

const MINISTER_COLORS: Record<string, string> = {
  gemini: '#1a73e8',
  claude: '#e84040',
  gpt: '#22c55e',
};

const MINISTER_ICONS: Record<string, string> = {
  gemini: '◈',
  claude: '◉',
  gpt: '◆',
};

export default function SessionHistoryScreen() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterDecision, setFilterDecision] = useState<DecisionType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rounds' | 'messages'>('date');

  const DECISION_CONFIG: Record<DecisionType, { label: string; color: string; bg: string; border: string }> = {
    setujui: { label: t.filterApproved, color: '#16a34a', bg: '#dcfce7', border: '#16a34a' },
    ubah: { label: t.filterChanged, color: '#e84040', bg: '#fee2e2', border: '#e84040' },
    lanjut: { label: t.filterContinue, color: '#1a73e8', bg: '#dbeafe', border: '#1a73e8' },
    pending: { label: t.filterPending, color: '#111111', bg: '#f5c800', border: '#111111' },
  };

  const filtered = React.useMemo(() => {
    let list = [...SESSIONS];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.topic.toLowerCase().includes(q) ||
          s.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (filterDecision !== 'all') {
      list = list.filter((s) => s.decision === filterDecision);
    }
    if (sortBy === 'rounds') list.sort((a, b) => b.roundCount - a.roundCount);
    else if (sortBy === 'messages') list.sort((a, b) => b.messageCount - a.messageCount);
    return list;
  }, [search, filterDecision, sortBy]);

  const stats = React.useMemo(
    () => ({
      total: SESSIONS.length,
      setujui: SESSIONS.filter((s) => s.decision === 'setujui').length,
      ubah: SESSIONS.filter((s) => s.decision === 'ubah').length,
      pending: SESSIONS.filter((s) => s.decision === 'pending' || s.decision === 'lanjut').length,
    }),
    []
  );

  return (
    <div
      className="h-screen overflow-y-auto scrollbar-royal halftone-bg"
      style={{ background: '#faf6ee' }}
    >
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="font-comic text-xs tracking-[0.2em] uppercase px-3 py-1 rounded-full"
              style={{ background: '#f5c800', border: '2px solid #111111', boxShadow: '2px 2px 0px #111111', color: '#111111' }}
            >
              {t.archiveBadge}
            </span>
          </div>
          <h1 className="font-comic text-3xl font-bold mb-1" style={{ color: '#111111' }}>
            {t.sessionHistoryTitle}
          </h1>
          <p className="text-sm font-semibold" style={{ color: '#666666' }}>
            {t.sessionHistorySubtitle}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: t.statTotalSessions, value: stats.total, color: '#111111', bg: '#f5c800', icon: '♛' },
            { label: t.statApproved, value: stats.setujui, color: '#16a34a', bg: '#dcfce7', icon: '✓' },
            { label: t.statChanged, value: stats.ubah, color: '#e84040', bg: '#fee2e2', icon: '↩' },
            { label: t.statPending, value: stats.pending, color: '#1a73e8', bg: '#dbeafe', icon: '⟳' },
          ].map((stat) => (
            <div
              key={`stat-${stat.label}`}
              className="rounded-xl p-4"
              style={{
                background: stat.bg,
                border: '3px solid #111111',
                boxShadow: '4px 4px 0px #111111',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] tracking-wide uppercase font-extrabold" style={{ color: stat.color }}>
                  {stat.label}
                </span>
                <span className="text-sm font-bold" style={{ color: stat.color }}>
                  {stat.icon}
                </span>
              </div>
              <div
                className="text-2xl font-extrabold tabular-nums font-comic"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[200px] max-w-xs"
            style={{
              background: '#ffffff',
              border: '2px solid #111111',
              boxShadow: '3px 3px 0px #111111',
            }}
          >
            <Icon name="MagnifyingGlassIcon" size={14} style={{ color: '#888888' }} className="flex-shrink-0" />
            <input
              type="text"
              placeholder={t.searchSessions}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm font-semibold outline-none flex-1"
              style={{ color: '#111111' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="transition-colors cursor-pointer"
                style={{ color: '#888888' }}
              >
                <Icon name="XMarkIcon" size={12} className="text-current" />
              </button>
            )}
          </div>

          {/* Decision filter */}
          <div className="flex items-center gap-1.5">
            {(['all', 'setujui', 'ubah', 'lanjut', 'pending'] as const).map((f) => {
              const isActive = filterDecision === f;
              const cfg = f !== 'all' ? DECISION_CONFIG[f] : null;
              const label = f === 'all' ? t.filterAll
                : f === 'setujui' ? t.filterApproved
                : f === 'ubah' ? t.filterChanged
                : f === 'lanjut' ? t.filterContinue
                : t.filterPending;
              return (
                <button
                  key={`filter-${f}`}
                  onClick={() => setFilterDecision(f)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 cursor-pointer"
                  style={{
                    background: isActive ? (cfg ? cfg.bg : '#f5c800') : '#ffffff',
                    border: `2px solid ${isActive ? (cfg ? cfg.border : '#111111') : '#cccccc'}`,
                    boxShadow: isActive ? `2px 2px 0px ${cfg ? cfg.border : '#111111'}` : 'none',
                    color: isActive ? (cfg ? cfg.color : 'var(--gold)') : 'var(--muted-foreground)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Sort */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">{t.sortBy}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-card border border-border rounded-lg px-2 py-1.5 text-[11px] text-foreground outline-none cursor-pointer"
            >
              <option value="date">{t.sortDate}</option>
              <option value="rounds">{t.sortRounds}</option>
              <option value="messages">{t.sortMessages}</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] text-muted-foreground">
            {filtered.length} {t.resultsCount} {SESSIONS.length} {t.sessions}
          </span>
        </div>

        {/* Session cards grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-4xl mb-4 opacity-20">♛</div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              {t.noSessionsFound}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t.noSessionsDesc}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
            {filtered.map((session) => (
              <SessionCard key={session.id} session={session} decisionConfig={DECISION_CONFIG} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({ session, decisionConfig }: { session: HistorySession; decisionConfig: Record<DecisionType, { label: string; color: string; bg: string; border: string }> }) {
  const { t } = useLanguage();
  const decisionCfg = decisionConfig[session.decision];

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 group cursor-pointer"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,168,83,0.3)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate mb-0.5">
            {session.title}
          </h3>
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            {session.topic}
          </p>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap"
          style={{
            color: decisionCfg.color,
            background: decisionCfg.bg,
            border: `1px solid ${decisionCfg.border}`,
          }}
        >
          {decisionCfg.label}
        </span>
      </div>

      {/* Ministers */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {session.ministers.map((m) => (
            <span
              key={`${session.id}-minister-${m}`}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md"
              style={{
                color: MINISTER_COLORS[m],
                background: `${MINISTER_COLORS[m]}12`,
                border: `1px solid ${MINISTER_COLORS[m]}20`,
              }}
            >
              {MINISTER_ICONS[m]} {m.charAt(0).toUpperCase() + m.slice(1)}
            </span>
          ))}
        </div>
      </div>

      {/* Verdict snippet */}
      <div
        className="rounded-xl p-3"
        style={{
          background: 'rgba(22,27,58,0.6)',
          border: '1px solid rgba(42,48,96,0.5)',
        }}
      >
        <p className="text-[11px] leading-relaxed text-muted-foreground italic">
          "{session.verdictSnippet}"
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {session.tags.map((tag) => (
          <span
            key={`${session.id}-tag-${tag}`}
            className="text-[9px] px-1.5 py-0.5 rounded font-medium tracking-wide uppercase"
            style={{
              background: 'rgba(42,48,96,0.4)',
              color: 'var(--muted-foreground)',
              border: '1px solid rgba(42,48,96,0.6)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border/30">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
            <Icon name="CalendarIcon" size={10} className="text-current" />
            {session.date}
          </span>
          <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
            <Icon name="ClockIcon" size={10} className="text-current" />
            {session.duration}
          </span>
          <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
            <Icon name="ArrowPathIcon" size={10} className="text-current" />
            {session.roundCount} {t.roundsLabel}
          </span>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1 text-[10px] font-medium transition-all duration-200"
          style={{ color: 'var(--gold)' }}
        >
          {t.continueSession}
          <Icon name="ArrowRightIcon" size={10} className="text-current" />
        </Link>
      </div>
    </div>
  );
}