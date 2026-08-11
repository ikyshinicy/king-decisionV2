'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { MinisterKey, MinisterState, SpeechBubble } from './CouncilSessionScreen';

interface MinisterCharacterProps {
  minister: MinisterKey;
  state: MinisterState;
  speechBubble: SpeechBubble;
  floatClass: string;
}

const MINISTER_CONFIG: Record<
  MinisterKey,
  {
    name: string;
    color: string;
    darkColor: string;
    capePrimary: string;
    capeSecondary: string;
    gemColor: string;
    crownColor: string;
    eyeColor: string;
    glowClass: string;
    bubblePosition: 'left' | 'right' | 'top';
  }
> = {
  gemini: {
    name: 'Gemini',
    color: '#38bdf8',
    darkColor: '#0ea5e9',
    capePrimary: '#1d6fa8',
    capeSecondary: '#0c4a75',
    gemColor: '#38bdf8',
    crownColor: '#d4a853',
    eyeColor: '#1e40af',
    glowClass: 'glow-gemini',
    bubblePosition: 'left',
  },
  claude: {
    name: 'Claude',
    color: '#c0392b',
    darkColor: '#9b2335',
    capePrimary: '#8b1a2a',
    capeSecondary: '#5c0f1a',
    gemColor: '#e74c3c',
    crownColor: '#d4a853',
    eyeColor: '#7b1d1d',
    glowClass: 'glow-claude',
    bubblePosition: 'top',
  },
  gpt: {
    name: 'GPT',
    color: '#10b981',
    darkColor: '#059669',
    capePrimary: '#065f46',
    capeSecondary: '#022c22',
    gemColor: '#10b981',
    crownColor: '#d4a853',
    eyeColor: '#064e3b',
    glowClass: 'glow-gpt',
    bubblePosition: 'right',
  },
};

export default function MinisterCharacter({
  minister,
  state,
  speechBubble,
  floatClass,
}: MinisterCharacterProps) {
  const config = MINISTER_CONFIG[minister];
  const [blinkState, setBlinkState] = useState(false);
  const blinkRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const scheduleBlink = () => {
      const nextBlink = 2500 + Math.floor(Math.random() * 3000);
      blinkRef.current = setTimeout(() => {
        setBlinkState(true);
        setTimeout(() => setBlinkState(false), 120);
        scheduleBlink();
      }, nextBlink);
    };
    scheduleBlink();
    return () => {
      if (blinkRef.current) clearTimeout(blinkRef.current);
    };
  }, []);

  const isActive = state === 'speaking' || state === 'presenting';
  const isThinking = state === 'thinking';
  const isAgreeing = state === 'agreeing';
  const isDisagreeing = state === 'disagreeing';
  const isListening = state === 'listening';

  const characterScale = isActive ? 1.06 : isListening ? 0.96 : 1;
  const characterOpacity = isListening ? 0.75 : 1;

  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        transform: `scale(${characterScale})`,
        opacity: characterOpacity,
        transition: 'transform 0.4s ease, opacity 0.4s ease',
      }}
    >
      {/* Speech Bubble */}
      {speechBubble.visible && (
        <SpeechBubble
          text={speechBubble.text}
          color={config.color}
          position={config.bubblePosition}
        />
      )}

      {/* Character wrapper */}
      <div
        className={`relative ${floatClass}`}
        style={{
          filter: isActive
            ? `drop-shadow(0 0 20px ${config.color}80) drop-shadow(0 0 40px ${config.color}30)`
            : isThinking
            ? `drop-shadow(0 0 8px ${config.color}40)`
            : 'none',
          transition: 'filter 0.5s ease',
        }}
      >
        {/* Active glow ring */}
        {isActive && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${config.color}15 0%, transparent 70%)`,
              animation: 'pulseRing 1.5s ease-out infinite',
              transform: 'scale(1.5)',
            }}
          />
        )}

        {/* SVG Character */}
        <GhostMinisterSVG
          config={config}
          state={state}
          blinkState={blinkState}
          minister={minister}
        />

        {/* Thinking dots */}
        {isThinking && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={`dot-${minister}-${i}`}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: config.color,
                  animation: `thinkingPulse 1s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GhostMinisterSVG({
  config,
  state,
  blinkState,
  minister,
}: {
  config: (typeof MINISTER_CONFIG)[MinisterKey];
  state: MinisterState;
  blinkState: boolean;
  minister: MinisterKey;
}) {
  const isSpeaking = state === 'speaking';
  const isAgreeing = state === 'agreeing';
  const isDisagreeing = state === 'disagreeing';
  const isSurprised = state === 'surprised';
  const isLaughing = state === 'laughing';

  // Mouth shape based on state
  const getMouthPath = () => {
    if (isSpeaking) return 'M 32 62 Q 40 68 48 62';
    if (isAgreeing || isLaughing) return 'M 30 62 Q 40 70 50 62';
    if (isDisagreeing) return 'M 32 66 Q 40 60 48 66';
    if (isSurprised) return 'M 36 62 Q 40 68 44 62';
    return 'M 33 63 Q 40 67 47 63';
  };

  const eyeScaleY = blinkState ? 0.1 : 1;

  return (
    <svg
      width="80"
      height="110"
      viewBox="0 0 80 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Defs */}
      <defs>
        <radialGradient id={`bodyGrad-${minister}`} cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f0f0f0" />
          <stop offset="100%" stopColor="#d8d8d8" />
        </radialGradient>
        <radialGradient id={`eyeGrad-${minister}`} cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor={config.eyeColor} />
        </radialGradient>
        <filter id={`glow-${minister}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`capeGrad-${minister}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={config.capePrimary} />
          <stop offset="100%" stopColor={config.capeSecondary} />
        </linearGradient>
        <linearGradient id={`crownGrad-${minister}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0c96a" />
          <stop offset="100%" stopColor="#b8893a" />
        </linearGradient>
      </defs>

      {/* Cape / Body lower */}
      <path
        d={`M 18 78 Q 10 100 12 120 L 40 125 L 68 120 Q 70 100 62 78 Z`}
        fill={`url(#capeGrad-${minister})`}
        opacity="0.95"
      />
      {/* Cape collar */}
      <path
        d={`M 22 70 Q 40 80 58 70 L 62 78 Q 40 90 18 78 Z`}
        fill={config.capePrimary}
        opacity="0.8"
      />
      {/* Cape gold trim */}
      <path
        d={`M 22 70 Q 40 80 58 70`}
        stroke="#d4a853"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />

      {/* Ghost body */}
      <ellipse
        cx="40"
        cy="60"
        rx="26"
        ry="30"
        fill={`url(#bodyGrad-${minister})`}
      />
      {/* Body bottom wavy */}
      <path
        d="M 14 80 Q 20 90 26 80 Q 32 90 40 80 Q 48 90 54 80 Q 60 90 66 80 L 66 60 Q 66 90 40 92 Q 14 90 14 60 Z"
        fill={`url(#bodyGrad-${minister})`}
      />

      {/* Body subtle sheen */}
      <ellipse cx="34" cy="50" rx="8" ry="10" fill="white" opacity="0.15" />

      {/* Small arms */}
      {/* Left arm */}
      <ellipse
        cx="13"
        cy="68"
        rx="6"
        ry="9"
        fill={`url(#bodyGrad-${minister})`}
        transform={
          state === 'presenting' || state === 'speaking' ?'rotate(-20, 13, 68)' :'rotate(0, 13, 68)'
        }
        style={{ transition: 'transform 0.4s ease' }}
      />
      {/* Right arm */}
      <ellipse
        cx="67"
        cy="68"
        rx="6"
        ry="9"
        fill={`url(#bodyGrad-${minister})`}
        transform={
          state === 'presenting' || state === 'disagreeing' ?'rotate(20, 67, 68)' :'rotate(0, 67, 68)'
        }
        style={{ transition: 'transform 0.4s ease' }}
      />

      {/* Eyes */}
      <g transform={`scale(1, ${eyeScaleY})`} style={{ transformOrigin: '40px 52px' }}>
        {/* Left eye white */}
        <ellipse cx="31" cy="52" rx="7" ry="8" fill="white" />
        {/* Right eye white */}
        <ellipse cx="49" cy="52" rx="7" ry="8" fill="white" />
        {/* Left pupil */}
        <circle
          cx="32"
          cy="53"
          r="4"
          fill={`url(#eyeGrad-${minister})`}
        />
        {/* Right pupil */}
        <circle
          cx="50"
          cy="53"
          r="4"
          fill={`url(#eyeGrad-${minister})`}
        />
        {/* Eye shine left */}
        <circle cx="33" cy="51" r="1.5" fill="white" opacity="0.9" />
        {/* Eye shine right */}
        <circle cx="51" cy="51" r="1.5" fill="white" opacity="0.9" />
      </g>

      {/* Eyebrows */}
      {isDisagreeing && (
        <>
          <path d="M 25 44 Q 31 41 37 43" stroke="#888" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 43 43 Q 49 41 55 44" stroke="#888" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {(isAgreeing || isLaughing) && (
        <>
          <path d="M 25 43 Q 31 40 37 42" stroke="#aaa" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 43 42 Q 49 40 55 43" stroke="#aaa" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* Mouth */}
      <path
        d={getMouthPath()}
        stroke={config.color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        style={{ transition: 'd 0.2s ease' }}
      />
      {/* Mouth fill when laughing/speaking */}
      {(isLaughing || isSpeaking) && (
        <path
          d={getMouthPath()}
          stroke="none"
          fill={config.color}
          opacity="0.15"
        />
      )}

      {/* Cheek blush */}
      <ellipse cx="24" cy="59" rx="5" ry="3" fill={config.color} opacity="0.12" />
      <ellipse cx="56" cy="59" rx="5" ry="3" fill={config.color} opacity="0.12" />

      {/* Crown */}
      <g transform="translate(20, 24)">
        {/* Crown base */}
        <rect x="0" y="8" width="40" height="8" rx="2" fill={`url(#crownGrad-${minister})`} />
        {/* Crown points */}
        <polygon points="4,8 8,0 12,8" fill={`url(#crownGrad-${minister})`} />
        <polygon points="16,8 20,2 24,8" fill={`url(#crownGrad-${minister})`} />
        <polygon points="28,8 32,0 36,8" fill={`url(#crownGrad-${minister})`} />
        {/* Crown gems */}
        <circle
          cx="20"
          cy="5"
          r="3"
          fill={config.gemColor}
          filter={`url(#glow-${minister})`}
          style={{ animation: 'gemGlow 2s ease-in-out infinite' }}
        />
        <circle cx="8" cy="8" r="2" fill={config.gemColor} opacity="0.8" />
        <circle cx="32" cy="8" r="2" fill={config.gemColor} opacity="0.8" />
        {/* Crown outline */}
        <path
          d="M 0 8 L 4 8 L 8 0 L 12 8 L 16 8 L 20 2 L 24 8 L 28 8 L 32 0 L 36 8 L 40 8 L 40 16 L 0 16 Z"
          stroke="#b8893a"
          strokeWidth="0.5"
          fill="none"
        />
      </g>

      {/* Cape brooch / gem */}
      <circle
        cx="40"
        cy="74"
        r="4"
        fill={config.gemColor}
        filter={`url(#glow-${minister})`}
        opacity="0.9"
      />
      <circle cx="40" cy="74" r="2.5" fill="white" opacity="0.4" />
    </svg>
  );
}

function SpeechBubble({
  text,
  color,
  position,
}: {
  text: string;
  color: string;
  position: 'left' | 'right' | 'top';
}) {
  const positionStyles: Record<string, React.CSSProperties> = {
    left: { bottom: '110%', right: '80%', minWidth: '160px', maxWidth: '200px' },
    right: { bottom: '110%', left: '80%', minWidth: '160px', maxWidth: '200px' },
    top: { bottom: '115%', left: '50%', transform: 'translateX(-50%)', minWidth: '180px', maxWidth: '220px' },
  };

  const tailStyles: Record<string, React.CSSProperties> = {
    left: { bottom: '-8px', right: '20px', borderLeft: '8px solid transparent', borderRight: '0', borderTop: `8px solid ${color}25`, left: 'auto' },
    right: { bottom: '-8px', left: '20px', borderRight: '8px solid transparent', borderLeft: '0', borderTop: `8px solid ${color}25` },
    top: { bottom: '-8px', left: '50%', transform: 'translateX(-50%)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `8px solid ${color}25` },
  };

  return (
    <div
      className="absolute speech-bubble-enter z-50 pointer-events-none"
      style={{
        ...positionStyles[position],
        background: `rgba(13,17,40,0.92)`,
        border: `1px solid ${color}40`,
        borderRadius: '12px',
        padding: '10px 12px',
        boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 12px ${color}20`,
      }}
    >
      <p
        className="text-[11px] leading-relaxed"
        style={{ color: 'var(--foreground)' }}
      >
        {text}
      </p>
      {/* Tail */}
      <div
        className="absolute w-0 h-0"
        style={tailStyles[position]}
      />
    </div>
  );
}