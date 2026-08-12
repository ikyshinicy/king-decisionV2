'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Message, VerdictData, SessionPhase } from './CouncilSessionScreen';
import CouncilVerdict from './CouncilVerdict';
import Icon from '@/components/ui/AppIcon';
import { useLanguage } from '@/components/LanguageProvider';

interface TranscriptPanelProps {
  messages: Message[];
  verdict: VerdictData | null;
  isOpen: boolean;
  onToggle: () => void;
  onDecision: (decision: 'setujui' | 'ubah' | 'lanjut') => void;
  phase: SessionPhase;
  pinnedIds?: string[];
  onTogglePin?: (id: string) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

const SENDER_CONFIG = {
  king: { label: 'Raja', color: '#111111', bg: '#f5c800', border: '#111111', icon: '♛' },
  gemini: { label: 'Gemini', color: '#1a73e8', bg: '#dbeafe', border: '#1a73e8', icon: '◈' },
  claude: { label: 'Claude', color: '#e84040', bg: '#fee2e2', border: '#e84040', icon: '◉' },
  gpt: { label: 'GPT', color: '#16a34a', bg: '#dcfce7', border: '#16a34a', icon: '◆' },
};

export default function TranscriptPanel({
  messages,
  verdict,
  isOpen,
  onToggle,
  onDecision,
  phase,
  pinnedIds = [],
  onTogglePin,
  isMuted = false,
  onToggleMute,
}: TranscriptPanelProps) {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (scrollRef.current && !searchQuery && !showPinnedOnly) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, searchQuery, showPinnedOnly]);

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = searchQuery
      ? msg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        SENDER_CONFIG[msg.sender].label.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesPin = showPinnedOnly ? pinnedIds.includes(msg.id) : true;
    return matchesSearch && matchesPin;
  });

  const panelContent = (
    <>
      {/* Header */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '3px solid #111111' }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xs font-extrabold tracking-[0.12em] uppercase" style={{ color: '#111111' }}>
              {t.transcriptTitle}
            </h2>
            <p className="text-[10px] font-semibold mt-0.5" style={{ color: '#888888' }}>
              {filteredMessages.length}/{messages.length} {t.messages}
              {pinnedIds.length > 0 && ` · ${pinnedIds.length} ${t.pinned}`}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Search toggle */}
            <button
              onClick={() => { setShowSearch((v) => !v); if (showSearch) setSearchQuery(''); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer"
              style={{
                background: showSearch ? '#111111' : '#f0ead8',
                border: '1.5px solid #111111',
                color: showSearch ? '#f5c800' : '#555',
              }}
              title={t.searchTranscript}
            >
              <Icon name="MagnifyingGlassIcon" size={12} className="text-current" />
            </button>
            {/* Mute / Unmute TTS */}
            {onToggleMute && (
              <button
                onClick={onToggleMute}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer"
                style={{
                  background: isMuted ? '#f0ead8' : '#111111',
                  border: '1.5px solid #111111',
                  color: isMuted ? '#555' : '#f5c800',
                }}
                title={isMuted ? 'Aktifkan Suara' : 'Matikan Suara'}
              >
                <span style={{ fontSize: 12 }}>{isMuted ? '🔇' : '🔊'}</span>
              </button>
            )}
            {/* Pin filter */}
            <button
              onClick={() => setShowPinnedOnly((v) => !v)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer"
              style={{
                background: showPinnedOnly ? '#f5c800' : '#f0ead8',
                border: '1.5px solid #111111',
                color: showPinnedOnly ? '#111111' : '#555',
              }}
              title={t.showPinnedOnly}
            >
              <span style={{ fontSize: 12 }}>📌</span>
            </button>
            <div className="flex items-center gap-1">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: phase === 'waiting' || phase === 'decided' ? 'var(--muted-foreground)' : 'var(--claude)',
                  boxShadow: phase !== 'waiting' && phase !== 'decided' ? '0 0 6px var(--claude)' : 'none',
                  animation: phase !== 'waiting' && phase !== 'decided' ? 'thinkingPulse 1s ease-in-out infinite' : 'none',
                }}
              />
              <span className="text-[9px] text-muted-foreground">
                {phase === 'decided' ? t.statusDone : phase === 'waiting' ? t.statusStandby : t.statusActive}
              </span>
            </div>
          </div>
        </div>

        {/* Search input */}
        {showSearch && (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              autoFocus
              className="w-full text-[11px] px-3 py-1.5 rounded-lg outline-none font-semibold"
              style={{
                background: '#f0ead8',
                border: '1.5px solid #111111',
                color: '#111111',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] cursor-pointer"
                style={{ color: '#888' }}
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-royal px-3 py-3 space-y-2">
        {filteredMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <span style={{ fontSize: 24 }}>{showPinnedOnly ? '📌' : '🔍'}</span>
            <p className="text-[11px] text-center" style={{ color: '#888' }}>
              {showPinnedOnly ? t.noPinnedMessages : t.noSearchResults}
            </p>
          </div>
        )}
        {filteredMessages.map((msg) => {
          const cfg = SENDER_CONFIG[msg.sender];
          const isPinned = pinnedIds.includes(msg.id);
          const isHighlighted = searchQuery && msg.text.toLowerCase().includes(searchQuery.toLowerCase());

          const highlightText = (text: string) => {
            if (!searchQuery) return text;
            const idx = text.toLowerCase().indexOf(searchQuery.toLowerCase());
            if (idx === -1) return text;
            return (
              <>
                {text.slice(0, idx)}
                <mark style={{ background: '#f5c80066', color: 'inherit', borderRadius: 2 }}>
                  {text.slice(idx, idx + searchQuery.length)}
                </mark>
                {text.slice(idx + searchQuery.length)}
              </>
            );
          };

          return (
            <div
              key={msg.id}
              className="transcript-message-enter group relative"
              style={{
                background: isPinned ? `${cfg.bg}` : cfg.bg,
                border: `1px solid ${isPinned ? '#f5c800' : cfg.border}`,
                borderRadius: '10px',
                padding: '8px 10px',
                boxShadow: isPinned ? '0 0 0 2px #f5c80066' : 'none',
                outline: isHighlighted ? '2px solid #f5c80088' : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px]" style={{ color: cfg.color }}>{cfg.icon}</span>
                  <span className="text-[10px] font-bold tracking-wide" style={{ color: cfg.color }}>
                    {cfg.label}
                  </span>
                  {msg.round && msg.round > 0 && (
                    <span className="text-[8px] px-1 py-0.5 rounded bg-muted/40 text-muted-foreground">
                      R{msg.round}
                    </span>
                  )}
                  {isPinned && <span style={{ fontSize: 9 }}>📌</span>}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-muted-foreground/50">{msg.timestamp}</span>
                  {onTogglePin && (
                    <button
                      onClick={() => onTogglePin(msg.id)}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center transition-all duration-150 cursor-pointer"
                      style={{
                        background: isPinned ? '#f5c800' : '#f0ead8',
                        border: '1px solid #111',
                        fontSize: 9,
                      }}
                      title={isPinned ? t.unpinMessage : t.pinMessage}
                    >
                      📌
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-foreground/80">
                {highlightText(msg.text)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Verdict */}
      {verdict && (
        <div className="border-t border-border/40 flex-shrink-0">
          <CouncilVerdict verdict={verdict} onDecision={onDecision} phase={phase} />
        </div>
      )}
    </>
  );

  // Mobile: bottom sheet
  if (isMobile) {
    return (
      <>
        {/* Floating transcript button */}
        {!isOpen && (
          <button
            onClick={onToggle}
            className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg transition-all duration-150 hover:scale-110 cursor-pointer"
            style={{ background: '#f5c800', border: '2px solid #111111', boxShadow: '3px 3px 0px #111111', color: '#111111', fontSize: 18 }}
          >
            📜
          </button>
        )}

        {/* Bottom sheet */}
        {isOpen && (
          <div
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl overflow-hidden"
            style={{
              height: '75vh',
              background: '#faf6ee',
              border: '3px solid #111111',
              borderBottom: 'none',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
            }}
          >
            {/* Sheet handle */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: '2px solid #111111' }}
            >
              <div className="w-10 h-1 rounded-full mx-auto" style={{ background: '#ccc' }} />
              <button
                onClick={onToggle}
                className="absolute right-4 top-3 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                style={{ background: '#f0ead8', border: '1.5px solid #111111' }}
              >
                <Icon name="XMarkIcon" size={12} />
              </button>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              {panelContent}
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop: sidebar panel
  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        background: '#faf6ee',
        borderLeft: '3px solid #111111',
        width: isOpen ? '320px' : '0px',
        minWidth: isOpen ? '320px' : '0px',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {isOpen && panelContent}
    </div>
  );
}