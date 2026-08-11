'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TranscriptPanel from './TranscriptPanel';
import Composer from './Composer';
import { loadProfile, getAIGreeting, getKingTitle } from '@/lib/profile';
import { useLanguage } from '@/components/LanguageProvider';

const CouncilScene = dynamic(() => import('./CouncilScene'), { ssr: false });

export type MinisterKey = 'gemini' | 'claude' | 'gpt';
export type MinisterState =
  | 'idle' | 'thinking' | 'speaking' | 'listening' | 'agreeing' | 'disagreeing' | 'laughing' | 'surprised' | 'presenting';

export type SessionPhase =
  | 'waiting' | 'gemini-speaking' | 'claude-speaking' | 'gpt-speaking' | 'debating' | 'verdict-pending' | 'decided';

export interface Message {
  id: string;
  sender: 'king' | MinisterKey;
  text: string;
  timestamp: string;
  round?: number;
  files?: { name: string; type: string; dataUrl: string }[];
  isStreaming?: boolean;
}

export interface SpeechBubble {
  minister: MinisterKey;
  text: string;
  visible: boolean;
}

export interface VerdictData {
  kesimpulan: string;
  risiko: string;
  peluang: string;
  rekomendasi: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-000',
    sender: 'king',
    text: 'Selamat datang di KING DECISION. Ajukan ide Anda kepada Dewan.',
    timestamp: '06:50',
    round: 0,
  },
];

const DEBATE_RESPONSES: Record<string, { gemini: string; claude: string; gpt: string }[]> = {
  default: [
    {
      gemini: 'Ide ini memiliki potensi inovasi yang luar biasa! Saya melihat peluang untuk membangun ekosistem yang belum pernah ada sebelumnya.',
      claude: 'Menarik, tapi ada satu risiko fundamental yang perlu kita hadapi: apakah pasar sudah siap? Adopsi bisa jauh lebih lambat dari perkiraan.',
      gpt: 'Setuju dengan keduanya. Mari kita bagi menjadi 3 fase: validasi pasar dalam 30 hari, MVP dalam 60 hari, dan scale dalam 90 hari.',
    },
    {
      gemini: 'Claude, saya menghargai kehati-hatianmu, tapi inovasi memerlukan keberanian! Teknologi AI saat ini justru mempercepat adopsi.',
      claude: 'GPT, rencana 3 fase itu terlalu optimistis. Validasi pasar saja butuh 60-90 hari jika dilakukan dengan benar. Kita perlu data dulu.',
      gpt: 'Baik, Claude ada benarnya. Revisi: 60 hari validasi ketat, 90 hari MVP, 6 bulan pertama untuk scale. Tapi mulai sekarang, bukan menunggu.',
    },
  ],
};

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function getTimestamp() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

/** Simulate streaming: update message text word by word */
async function streamText(
  text: string,
  msgId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  stopRef: React.MutableRefObject<boolean>
): Promise<void> {
  const words = text.split(' ');
  let accumulated = '';
  for (let i = 0; i < words.length; i++) {
    if (stopRef.current) break;
    accumulated += (i === 0 ? '' : ' ') + words[i];
    const current = accumulated;
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, text: current, isStreaming: i < words.length - 1 } : m))
    );
    await delay(55 + Math.random() * 40);
  }
  // Mark streaming done
  setMessages((prev) =>
    prev.map((m) => (m.id === msgId ? { ...m, isStreaming: false } : m))
  );
}

/** Extract a short session title from the first user message */
function extractSessionTitle(text: string): string {
  const cleaned = text.trim().replace(/[?!.,;:]+$/, '');
  const words = cleaned.split(/\s+/);
  if (words.length <= 5) return cleaned;
  return words.slice(0, 5).join(' ') + '…';
}

export default function CouncilSessionScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [phase, setPhase] = useState<SessionPhase>('waiting');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [ministerStates, setMinisterStates] = useState<Record<MinisterKey, MinisterState>>(
    { gemini: 'idle', claude: 'idle', gpt: 'idle' }
  );
  const [speechBubbles, setSpeechBubbles] = useState<Record<MinisterKey, SpeechBubble>>({
    gemini: { minister: 'gemini', text: '', visible: false },
    claude: { minister: 'claude', text: '', visible: false },
    gpt: { minister: 'gpt', text: '', visible: false },
  });
  const [verdict, setVerdict] = useState<VerdictData | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(true);
  const [debateRound, setDebateRound] = useState(0);
  const [statusText, setStatusText] = useState('Menunggu titah Raja');
  const [kingTitle, setKingTitle] = useState('Yang Mulia Raja');
  const [isMuted, setIsMuted] = useState(false);
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const debateIndexRef = useRef(0);
  const stopDebateRef = useRef(false);
  const isMutedRef = useRef(false);
  const hasSetTitleRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // ── Onboarding check ──
  useEffect(() => {
    const profile = loadProfile();
    if (!profile || (!profile.fullName && !profile.username)) {
      // Profile incomplete — redirect to profile page
      router.replace('/profile?onboarding=1');
      return;
    }
    setKingTitle(getKingTitle(profile));
    const greeting = getAIGreeting(profile);
    setMessages([
      {
        id: 'msg-000',
        sender: 'king',
        text: `${t.welcomeMessage.replace('KING DECISION', 'KING DECISION').split('.')[0]}, ${greeting}. ${t.welcomeMessage.split('. ').slice(1).join('. ')}`,
        timestamp: '06:50',
        round: 0,
      },
    ]);
  }, [router, t]);

  const ministerVoiceConfig: Record<MinisterKey, { pitch: number; rate: number; lang: string }> = {
    gemini: { pitch: 1.2, rate: 1.0, lang: 'id-ID' },
    claude: { pitch: 0.85, rate: 0.9, lang: 'id-ID' },
    gpt: { pitch: 1.0, rate: 1.05, lang: 'id-ID' },
  };

  const speakText = useCallback((text: string, minister: MinisterKey): Promise<void> => {
    return new Promise((resolve) => {
      if (isMutedRef.current || typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const config = ministerVoiceConfig[minister];
      utterance.pitch = config.pitch;
      utterance.rate = config.rate;
      utterance.lang = config.lang;
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find((v) => v.lang.startsWith('id'));
      if (idVoice) utterance.voice = idVoice;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const setMinisterState = useCallback((minister: MinisterKey, state: MinisterState) => {
    setMinisterStates((prev) => ({ ...prev, [minister]: state }));
  }, []);

  const showSpeechBubble = useCallback((minister: MinisterKey, text: string, duration = 4000) => {
    setSpeechBubbles((prev) => ({ ...prev, [minister]: { minister, text, visible: true } }));
    setTimeout(() => {
      setSpeechBubbles((prev) => ({ ...prev, [minister]: { ...prev[minister], visible: false } }));
    }, duration);
  }, []);

  /** Add a placeholder message and stream text into it */
  const addStreamingMessage = useCallback(
    async (sender: 'king' | MinisterKey, text: string, round?: number) => {
      const msgId = generateId('msg');
      const placeholder: Message = {
        id: msgId,
        sender,
        text: '',
        timestamp: getTimestamp(),
        round,
        isStreaming: true,
      };
      setMessages((prev) => [...prev, placeholder]);
      await streamText(text, msgId, setMessages, stopDebateRef);
    },
    []
  );

  const addMessage = useCallback((sender: 'king' | MinisterKey, text: string, round?: number) => {
    const msg: Message = {
      id: generateId('msg'),
      sender,
      text,
      timestamp: getTimestamp(),
      round,
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleTogglePin = useCallback((id: string) => {
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }, []);

  const runDebateSequence = useCallback(
    async (input: string, roundIndex: number) => {
      const responses = DEBATE_RESPONSES['default'][roundIndex % DEBATE_RESPONSES['default'].length];

      // Gemini speaks
      setPhase('gemini-speaking');
      setStatusText('Gemini sedang berbicara...');
      setMinisterState('gemini', 'speaking');
      setMinisterState('claude', 'listening');
      setMinisterState('gpt', 'listening');
      await delay(600);
      if (stopDebateRef.current) return;
      showSpeechBubble('gemini', responses.gemini.slice(0, 60) + '...', 4500);
      await delay(400);
      if (stopDebateRef.current) return;
      await addStreamingMessage('gemini', responses.gemini, roundIndex + 1);
      await speakText(responses.gemini, 'gemini');
      if (stopDebateRef.current) return;
      await delay(400);
      if (stopDebateRef.current) return;

      // Claude speaks
      setPhase('claude-speaking');
      setStatusText('Claude sedang berbicara...');
      setMinisterState('gemini', 'listening');
      setMinisterState('claude', 'speaking');
      setMinisterState('gpt', 'listening');
      await delay(600);
      if (stopDebateRef.current) return;
      showSpeechBubble('claude', responses.claude.slice(0, 60) + '...', 4500);
      await delay(400);
      if (stopDebateRef.current) return;
      await addStreamingMessage('claude', responses.claude, roundIndex + 1);
      await speakText(responses.claude, 'claude');
      if (stopDebateRef.current) return;
      await delay(400);
      if (stopDebateRef.current) return;

      // GPT speaks
      setPhase('gpt-speaking');
      setStatusText('GPT sedang berbicara...');
      setMinisterState('gemini', 'listening');
      setMinisterState('claude', 'listening');
      setMinisterState('gpt', 'speaking');
      await delay(600);
      if (stopDebateRef.current) return;
      showSpeechBubble('gpt', responses.gpt.slice(0, 60) + '...', 4500);
      await delay(400);
      if (stopDebateRef.current) return;
      await addStreamingMessage('gpt', responses.gpt, roundIndex + 1);
      await speakText(responses.gpt, 'gpt');
      if (stopDebateRef.current) return;
      await delay(400);
      if (stopDebateRef.current) return;

      // All thinking
      setPhase('debating');
      setStatusText('Dewan sedang berdebat...');
      setMinisterState('gemini', 'thinking');
      setMinisterState('claude', 'thinking');
      setMinisterState('gpt', 'thinking');
      await delay(2000);
      if (stopDebateRef.current) return;

      // Verdict
      setPhase('verdict-pending');
      setStatusText('Menunggu titah Raja');
      setMinisterState('gemini', 'idle');
      setMinisterState('claude', 'idle');
      setMinisterState('gpt', 'idle');
      setVerdict({
        kesimpulan: 'Ide memiliki potensi tinggi dengan model eksekusi bertahap. Ketiga menteri sepakat bahwa validasi pasar adalah langkah kritis pertama.',
        risiko: 'Adopsi pasar yang lambat, estimasi timeline terlalu optimistis, dan kebutuhan modal awal yang signifikan.',
        peluang: 'Ekosistem AI yang berkembang pesat, celah pasar yang belum terjamah, dan momentum teknologi yang mendukung.',
        rekomendasi: 'Mulai dengan validasi 60 hari, bangun MVP fokus, dan scale berdasarkan data nyata — bukan asumsi.',
      });
    },
    [addStreamingMessage, setMinisterState, showSpeechBubble, speakText]
  );

  const handleSubmit = useCallback(
    async (text: string, files?: { id: string; name: string; size: number; type: string; dataUrl: string }[]) => {
      if (!text.trim()) return;
      stopDebateRef.current = false;
      addMessage('king', text, undefined);

      // Auto-name session from first user message
      if (!hasSetTitleRef.current) {
        hasSetTitleRef.current = true;
        setSessionTitle(extractSessionTitle(text));
      }

      if (files && files.length > 0) {
        const fileNames = files.map((f) => f.name).join(', ');
        addMessage('king', `📎 File dilampirkan untuk dianalisis: ${fileNames}`);
      }
      setVerdict(null);
      setPhase('gemini-speaking');
      setStatusText('Council sedang berdebat...');
      debateIndexRef.current = debateRound;
      await delay(400);
      runDebateSequence(text, debateRound);
    },
    [addMessage, debateRound, runDebateSequence]
  );

  const handleCallMinister = useCallback(
    (minister: MinisterKey, greeting: string) => {
      addMessage('king', greeting);
      setMinisterState(minister, 'listening');
      const acks: Record<MinisterKey, string> = {
        gemini: 'Siap, Tuanku! Saya mendengarkan. ✦',
        claude: 'Dengan hormat, Tuanku. Saya siap. ◈',
        gpt: 'Siap melayani, Tuanku! ⬡',
      };
      showSpeechBubble(minister, acks[minister], 3000);
      setTimeout(() => setMinisterState(minister, 'idle'), 3200);
    },
    [addMessage, setMinisterState, showSpeechBubble]
  );

  const handleDebate = useCallback(async () => {
    stopDebateRef.current = false;
    const nextRound = debateRound + 1;
    setDebateRound(nextRound);
    setVerdict(null);
    setStatusText('Ronde debat baru dimulai...');
    await delay(400);
    runDebateSequence('Lanjutkan debat', nextRound);
  }, [debateRound, runDebateSequence]);

  const handleStop = useCallback(() => {
    stopDebateRef.current = true;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPhase('waiting');
    setStatusText('Sidang dihentikan oleh Raja');
    setMinisterState('gemini', 'idle');
    setMinisterState('claude', 'idle');
    setMinisterState('gpt', 'idle');
    setSpeechBubbles({
      gemini: { minister: 'gemini', text: '', visible: false },
      claude: { minister: 'claude', text: '', visible: false },
      gpt: { minister: 'gpt', text: '', visible: false },
    });
    addMessage('king', '— Sidang dihentikan oleh Raja —');
  }, [addMessage, setMinisterState]);

  const handleDecision = useCallback(
    (decision: 'setujui' | 'ubah' | 'lanjut') => {
      const decisionMap = {
        setujui: 'Keputusan Raja: DISETUJUI ✓',
        ubah: 'Keputusan Raja: UBAH ARAH — evaluasi ulang diperlukan',
        lanjut: 'Keputusan Raja: LANJUTKAN DEBAT — ronde berikutnya',
      };
      addMessage('king', decisionMap[decision]);
      if (decision === 'lanjut') {
        handleDebate();
      } else {
        setPhase('decided');
        setStatusText('Sidang selesai — Raja telah memutuskan');
        setMinisterState('gemini', decision === 'setujui' ? 'agreeing' : 'idle');
        setMinisterState('claude', decision === 'setujui' ? 'agreeing' : 'idle');
        setMinisterState('gpt', decision === 'setujui' ? 'agreeing' : 'laughing');
      }
    },
    [addMessage, handleDebate, setMinisterState]
  );

  const isDebating =
    phase === 'gemini-speaking' ||
    phase === 'claude-speaking' ||
    phase === 'gpt-speaking' ||
    phase === 'debating';

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Session title badge */}
      {sessionTitle && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full text-[11px] font-bold"
          style={{
            background: '#f5c800',
            border: '2px solid #111111',
            boxShadow: '2px 2px 0px #111111',
            color: '#111111',
            maxWidth: 260,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={sessionTitle}
        >
          ♛ {sessionTitle}
        </div>
      )}

      {/* Profile Button */}
      <Link
        href="/profile"
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-150 hover:scale-110"
        style={{ background: '#f5c800', border: '2px solid #111111', boxShadow: '2px 2px 0px #111111', color: '#111111' }}
        title="Profil Raja"
      >
        ♛
      </Link>

      {/* Mute / Unmute TTS Button */}
      <button
        onClick={() => {
          if (!isMuted && typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
          setIsMuted((v) => !v);
        }}
        className="absolute top-4 right-16 z-50 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-150 hover:scale-110"
        style={{
          background: isMuted ? '#444' : '#1a1a2e',
          border: '2px solid #111111',
          boxShadow: '2px 2px 0px #111111',
          color: isMuted ? '#888' : '#f5c800',
        }}
        title={isMuted ? 'Aktifkan Suara' : 'Matikan Suara'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Council Scene */}
      <div className="flex-1 relative overflow-hidden">
        <CouncilScene ministerStates={ministerStates} speechBubbles={speechBubbles} phase={phase} />

        {/* Composer */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 z-30">
          <Composer
            onSubmit={handleSubmit}
            onDebate={handleDebate}
            onPause={() => { setPhase('waiting'); setStatusText('Sidang dijeda'); }}
            onContinue={handleDebate}
            onStop={handleStop}
            onCallMinister={handleCallMinister}
            isDebating={isDebating}
            statusText={statusText}
            phase={phase}
          />
        </div>
      </div>

      {/* Transcript Panel */}
      <TranscriptPanel
        messages={messages}
        verdict={verdict}
        isOpen={transcriptOpen}
        onToggle={() => setTranscriptOpen((v) => !v)}
        onDecision={handleDecision}
        phase={phase}
        pinnedIds={pinnedIds}
        onTogglePin={handleTogglePin}
      />
    </div>
  );
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}