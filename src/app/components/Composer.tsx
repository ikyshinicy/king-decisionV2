'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { SessionPhase, MinisterKey } from './CouncilSessionScreen';
import Icon from '@/components/ui/AppIcon';
import { useLanguage } from '@/components/LanguageProvider';

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

interface ComposerProps {
  onSubmit: (text: string, files?: AttachedFile[]) => void;
  onDebate: () => void;
  onPause: () => void;
  onContinue: () => void;
  onStop: () => void;
  onCallMinister?: (minister: MinisterKey, greeting: string) => void;
  isDebating: boolean;
  statusText: string;
  phase: SessionPhase;
}

const MINISTERS: { key: MinisterKey; label: string; emoji: string; color: string; greetings: { id: string; en: string }[] }[] = [
  {
    key: 'gemini',
    label: 'Gemini',
    emoji: '✦',
    color: '#4285F4',
    greetings: [
      { id: 'Gemini, apa pendapatmu tentang ini?', en: 'Gemini, what is your opinion on this?' },
      { id: 'Wahai Gemini, berikan analisismu!', en: 'Gemini, give us your analysis!' },
      { id: 'Gemini, tolong elaborasi lebih lanjut.', en: 'Gemini, please elaborate further.' },
    ],
  },
  {
    key: 'claude',
    label: 'Claude',
    emoji: '◈',
    color: '#D97706',
    greetings: [
      { id: 'Claude, apa risikonya menurut pandanganmu?', en: 'Claude, what are the risks in your view?' },
      { id: 'Wahai Claude, berikan perspektif kritismu!', en: 'Claude, give us your critical perspective!' },
      { id: 'Claude, tolong evaluasi lebih mendalam.', en: 'Claude, please evaluate more deeply.' },
    ],
  },
  {
    key: 'gpt',
    label: 'GPT',
    emoji: '⬡',
    color: '#10B981',
    greetings: [
      { id: 'GPT, susunkan rencana aksi untuk ini!', en: 'GPT, create an action plan for this!' },
      { id: 'Wahai GPT, berikan strategi terbaikmu!', en: 'GPT, give us your best strategy!' },
      { id: 'GPT, tolong buat roadmap yang jelas.', en: 'GPT, please create a clear roadmap.' },
    ],
  },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️';
  if (type === 'application/pdf') return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return '📊';
  if (type.startsWith('text/')) return '📃';
  return '📎';
}

export default function Composer({
  onSubmit,
  onDebate,
  onPause,
  onContinue,
  onStop,
  onCallMinister,
  isDebating,
  statusText,
  phase,
}: ComposerProps) {
  const { t, language } = useLanguage();
  const [value, setValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileComposerOpen, setMobileComposerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!value.trim() || isDebating) return;
    onSubmit(value.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
    setValue('');
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (isMobile) setMobileComposerOpen(false);
  }, [value, isDebating, attachedFiles, onSubmit, isMobile]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleSubmit();
        return;
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
        return;
      }
      if (e.key === 'Escape' && isDebating) {
        onStop();
        return;
      }
    },
    [handleSubmit, isDebating, onStop]
  );

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDebating) {
        onStop();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isDebating, onStop]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setAttachedFiles((prev) => [
          ...prev,
          {
            id: `file-${Date.now()}-${Math.random()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleCallMinister = (minister: typeof MINISTERS[0]) => {
    const greetingObj = minister.greetings[Math.floor(Math.random() * minister.greetings.length)];
    const greeting = language === 'en' ? greetingObj.en : greetingObj.id;
    if (onCallMinister) {
      onCallMinister(minister.key, greeting);
    }
    setValue((prev) => (prev ? prev + ' ' + greeting : greeting));
    textareaRef.current?.focus();
  };

  const composerBody = (
    <div className="flex flex-col gap-2">
      {/* ── Minister Call Panel ── */}
      <div
        data-tour="call-minister"
        className="rounded-xl px-3 py-2 flex items-center gap-2 flex-wrap"
        style={{
          background: 'rgba(20,18,14,0.82)',
          border: '2px solid #2a2520',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span className="text-[10px] font-bold mr-1 flex-shrink-0" style={{ color: '#888' }}>
          {t.callMinister}
        </span>
        {MINISTERS.map((m) => (
          <button
            key={m.key}
            onClick={() => handleCallMinister(m)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: `${m.color}22`,
              border: `1.5px solid ${m.color}66`,
              color: m.color,
            }}
            title={`${language === 'en' ? 'Call' : 'Panggil'} ${m.label}`}
          >
            <span style={{ fontSize: 12 }}>{m.emoji}</span>
            {m.label}
          </button>
        ))}
        <span className="text-[9px] ml-auto flex-shrink-0" style={{ color: '#555' }}>
          {t.clickToGreet}
        </span>
      </div>

      {/* ── File Upload / Attachment Area ── */}
      <div
        data-tour="attachment-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="rounded-xl px-3 py-2 flex items-center gap-2 cursor-pointer transition-all duration-150"
        style={{
          background: isDragOver ? 'rgba(245,200,0,0.1)' : 'rgba(20,18,14,0.5)',
          border: `1.5px dashed ${isDragOver ? '#f5c800' : '#3a3530'}`,
          backdropFilter: 'blur(4px)',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Icon name="PaperClipIcon" size={13} style={{ color: '#666', flexShrink: 0 }} />
        <span className="text-[10px] font-semibold" style={{ color: '#666' }}>
          {t.dragDropFiles}{' '}
          <span style={{ color: '#f5c800', textDecoration: 'underline' }}>{t.browseFiles}</span>
        </span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
        />
      </div>

      {/* Attached files preview */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold"
              style={{
                background: 'rgba(245,200,0,0.12)',
                border: '1px solid rgba(245,200,0,0.3)',
                color: '#f5c800',
              }}
            >
              <span>{getFileIcon(file.type)}</span>
              <span className="max-w-[100px] truncate">{file.name}</span>
              <span style={{ color: '#888' }}>({formatFileSize(file.size)})</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                className="ml-1 opacity-60 hover:opacity-100 cursor-pointer"
                title={t.removeFile}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Main input row ── */}
      <div className="flex items-end gap-2">
        <div
          className="flex-1 rounded-xl overflow-hidden"
          style={{
            background: 'rgba(20,18,14,0.85)',
            border: '2px solid #2a2520',
            backdropFilter: 'blur(8px)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={t.sendMessage}
            disabled={isDebating}
            rows={1}
            className="w-full px-4 py-3 text-sm font-semibold resize-none outline-none bg-transparent"
            style={{
              color: '#f0ead8',
              minHeight: '44px',
              maxHeight: '120px',
              lineHeight: '1.5',
              caretColor: '#f5c800',
            }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || isDebating}
            data-tour="send-button"
            className="w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: '#f5c800',
              border: '2px solid #111111',
              boxShadow: value.trim() && !isDebating ? '3px 3px 0px #111111' : 'none',
              color: '#111111',
            }}
            title={t.sendBtn}
          >
            <Icon name="PaperAirplaneIcon" size={16} className="text-current" />
          </button>

          {/* Debate control button */}
          {phase === 'waiting' || phase === 'decided' ? (
            <button
              onClick={onDebate}
              data-tour="debate-button"
              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-all duration-150 cursor-pointer"
              style={{
                background: '#111111',
                border: '2px solid #f5c800',
                boxShadow: '3px 3px 0px #f5c800',
                color: '#f5c800',
              }}
              title={t.startDebate}
            >
              <Icon name="BoltIcon" size={16} className="text-current" />
            </button>
          ) : (
            <button
              onClick={onStop}
              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-all duration-150 cursor-pointer"
              style={{
                background: '#e84040',
                border: '2px solid #111111',
                boxShadow: '3px 3px 0px #111111',
                color: '#ffffff',
              }}
              title={t.stopDebate}
            >
              <Icon name="StopIcon" size={16} className="text-current" />
            </button>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[9px] font-semibold" style={{ color: '#555' }}>
          {statusText}
        </span>
        <span className="text-[9px]" style={{ color: '#444' }}>
          Enter ↵ {language === 'en' ? 'send' : 'kirim'} · Shift+Enter {language === 'en' ? 'new line' : 'baris baru'} · Esc {language === 'en' ? 'stop' : 'stop'}
        </span>
      </div>
    </div>
  );

  // Mobile: floating button + bottom sheet
  if (isMobile) {
    return (
      <>
        {!mobileComposerOpen && (
          <button
            onClick={() => setMobileComposerOpen(true)}
            className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg transition-all duration-150 hover:scale-110 cursor-pointer"
            style={{ background: '#111111', border: '2px solid #f5c800', boxShadow: '3px 3px 0px #f5c800', color: '#f5c800', fontSize: 18 }}
          >
            ✍
          </button>
        )}

        {mobileComposerOpen && (
          <div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl overflow-hidden"
            style={{
              background: 'rgba(15,12,8,0.97)',
              border: '3px solid #2a2520',
              borderBottom: 'none',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #2a2520' }}>
              <span className="text-[11px] font-bold" style={{ color: '#888' }}>
                {language === 'en' ? 'Send Message' : 'Kirim Pesan'}
              </span>
              <button
                onClick={() => setMobileComposerOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                style={{ background: '#2a2520', border: '1px solid #3a3530', color: '#888' }}
              >
                <Icon name="XMarkIcon" size={12} />
              </button>
            </div>
            <div className="p-3">
              {composerBody}
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop
  return (
    <div
      data-tour="composer"
      className="px-4 py-3"
      style={{
        background: 'rgba(15,12,8,0.92)',
        borderTop: '3px solid #2a2520',
        backdropFilter: 'blur(12px)',
      }}
    >
      {composerBody}
    </div>
  );
}