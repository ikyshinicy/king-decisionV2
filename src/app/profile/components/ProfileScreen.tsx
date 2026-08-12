'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useTheme } from '@/components/ThemeProvider';
import type { ThemeMode } from '@/lib/theme';
import { useLanguage } from '@/components/LanguageProvider';

import { saveProfile, loadProfile, type UserProfile, type Gender, getTitlesForGender } from '@/lib/profile';

const GENDER_OPTIONS: { value: Gender; icon: string; labelId: string; labelEn: string }[] = [
  { value: 'male', icon: '♚', labelId: 'Raja', labelEn: 'King' },
  { value: 'female', icon: '♛', labelId: 'Ratu', labelEn: 'Queen' },
  { value: 'other', icon: '✦', labelId: 'Lainnya', labelEn: 'Other' },
];

const THEME_OPTIONS: { value: ThemeMode; labelId: string; labelEn: string; icon: string; descId: string; descEn: string; bg: string; border: string; textColor: string }[] = [
  {
    value: 'colorful',
    labelId: 'Color Full',
    labelEn: 'Color Full',
    icon: '🎨',
    descId: 'Kuning & Biru',
    descEn: 'Yellow & Blue',
    bg: '#f5c800',
    border: '#111111',
    textColor: '#111111',
  },
  {
    value: 'mono',
    labelId: 'Monokrom',
    labelEn: 'Monochrome',
    icon: '◑',
    descId: 'Hitam & Putih',
    descEn: 'Black & White',
    bg: '#333333',
    border: '#111111',
    textColor: '#ffffff',
  },
  {
    value: 'dark',
    labelId: 'Dark Mode',
    labelEn: 'Dark Mode',
    icon: '🌙',
    descId: 'Gelap & Elegan',
    descEn: 'Dark & Elegant',
    bg: '#0f0f0f',
    border: '#444444',
    textColor: '#f0f0f0',
  },
];

// ─── Shared form fields component ───────────────────────────────────────────

interface ProfileFormProps {
  fullName: string; setFullName: (v: string) => void;
  username: string; setUsername: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  gender: Gender; setGender: (v: Gender) => void;
  customTitle: string; setCustomTitle: (v: string) => void;
  theme: ThemeMode; setTheme: (v: ThemeMode) => void;
  saved: boolean;
  onSave: () => void;
  showTheme?: boolean;
}

function ProfileFormFields({
  fullName, setFullName,
  username, setUsername,
  email, setEmail,
  phone, setPhone,
  gender, setGender,
  customTitle, setCustomTitle,
  theme, setTheme,
  saved, onSave,
  showTheme = true,
}: ProfileFormProps) {
  const { t, language } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleOptions = getTitlesForGender(gender);
  const previewName = fullName.trim() || username.trim() || '...';

  useEffect(() => {
    const titles = getTitlesForGender(gender);
    if (!titles.includes(customTitle)) {
      setCustomTitle(titles[0]);
    }
  }, [gender]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setShowCustomInput(false);
        setCustomInput('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTitle = (title: string) => {
    setCustomTitle(title);
    setDropdownOpen(false);
    setShowCustomInput(false);
    setCustomInput('');
  };

  const handleAddCustom = () => {
    if (customInput.trim()) {
      setCustomTitle(customInput.trim());
      setDropdownOpen(false);
      setShowCustomInput(false);
      setCustomInput('');
    }
  };

  const inputStyle = {
    background: 'var(--input)',
    border: '2px solid var(--border)',
    color: 'var(--foreground)',
  };

  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--secondary)';
    e.currentTarget.style.boxShadow = '3px 3px 0px var(--secondary)';
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--border)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className="space-y-4">
      {/* Theme Selector */}
      {showTheme && (
        <div className="space-y-2">
          <label className="text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: 'var(--muted-foreground)' }}>
            {t.themeDisplay}
          </label>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((opt) => {
              const isActive = theme === opt.value;
              const label = language === 'en' ? opt.labelEn : opt.labelId;
              const desc = language === 'en' ? opt.descEn : opt.descId;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  title={label}
                  className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all duration-150 cursor-pointer"
                  style={{
                    background: isActive ? opt.bg : 'var(--muted)',
                    border: `2px solid ${isActive ? opt.border : 'var(--border)'}`,
                    boxShadow: isActive ? `3px 3px 0px ${opt.border}` : '2px 2px 0px var(--border)',
                    transform: isActive ? 'translate(-1px, -1px)' : 'none',
                  }}
                >
                  <span className="text-xl leading-none">{opt.icon}</span>
                  <span className="text-[9px] font-extrabold leading-tight text-center" style={{ color: isActive ? opt.textColor : 'var(--muted-foreground)' }}>
                    {label}
                  </span>
                  <span className="text-[8px] font-semibold leading-tight text-center" style={{ color: isActive ? opt.textColor : 'var(--muted-foreground)', opacity: 0.7 }}>
                    {desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showTheme && <div style={{ borderTop: '2px dashed var(--muted)' }} />}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: 'var(--muted-foreground)' }}>
          {t.fullName}
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t.fullNamePlaceholder}
          className="w-full px-4 py-2 rounded-xl text-sm font-semibold outline-none transition-all duration-150"
          style={inputStyle}
          onFocus={inputFocus}
          onBlur={inputBlur}
        />
      </div>

      {/* Username */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: 'var(--muted-foreground)' }}>
          {t.username}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold select-none" style={{ color: 'var(--muted-foreground)' }}>@</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
            placeholder={t.usernamePlaceholder}
            className="w-full pl-8 pr-4 py-2 rounded-xl text-sm font-semibold outline-none transition-all duration-150"
            style={inputStyle}
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: 'var(--muted-foreground)' }}>
          {t.email}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
            <Icon name="EnvelopeIcon" size={15} />
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm font-semibold outline-none transition-all duration-150"
            style={inputStyle}
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: 'var(--muted-foreground)' }}>
          {t.phone}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
            <Icon name="PhoneIcon" size={15} />
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.phonePlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm font-semibold outline-none transition-all duration-150"
            style={inputStyle}
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: 'var(--muted-foreground)' }}>
          {t.genderTitle}
        </label>
        <div className="flex gap-3">
          {GENDER_OPTIONS.map((opt) => {
            const isSelected = gender === opt.value;
            const label = language === 'en' ? opt.labelEn : opt.labelId;
            return (
              <button
                key={opt.value}
                onClick={() => setGender(opt.value)}
                title={label}
                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-150 cursor-pointer"
                style={{
                  background: isSelected ? 'var(--primary)' : 'var(--input)',
                  border: `2px solid var(--border)`,
                  boxShadow: isSelected ? '3px 3px 0px var(--border)' : '2px 2px 0px var(--border)',
                  transform: isSelected ? 'translate(-1px, -1px)' : 'none',
                }}
              >
                <span className="text-2xl leading-none">{opt.icon}</span>
                <span className="text-[9px] font-extrabold" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Royal Title Dropdown */}
      <div className="space-y-1.5" ref={dropdownRef}>
        <label className="text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: 'var(--muted-foreground)' }}>
          {t.royalTitle}
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => { setDropdownOpen((v) => !v); setShowCustomInput(false); setCustomInput(''); }}
            className="w-full px-4 py-2 rounded-xl text-sm font-semibold outline-none transition-all duration-150 flex items-center justify-between cursor-pointer"
            style={{
              background: 'var(--input)',
              border: dropdownOpen ? '2px solid var(--secondary)' : '2px solid var(--border)',
              boxShadow: dropdownOpen ? '3px 3px 0px var(--secondary)' : 'none',
              color: 'var(--foreground)',
            }}
          >
            <span>{customTitle || t.selectTitle}</span>
            <Icon name={dropdownOpen ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={16} />
          </button>

          {dropdownOpen && (
            <div
              className="absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-50"
              style={{
                background: 'var(--card)',
                border: '2px solid var(--border)',
                boxShadow: '4px 4px 0px var(--border)',
              }}
            >
              <div className="max-h-48 overflow-y-auto">
                {titleOptions.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => handleSelectTitle(title)}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
                    style={{
                      background: customTitle === title ? 'var(--primary)' : 'transparent',
                      color: 'var(--foreground)',
                      borderBottom: '1px solid var(--muted)',
                    }}
                    onMouseEnter={(e) => { if (customTitle !== title) e.currentTarget.style.background = 'var(--muted)'; }}
                    onMouseLeave={(e) => { if (customTitle !== title) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {title}
                  </button>
                ))}
              </div>
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-extrabold cursor-pointer transition-colors"
                  style={{ color: 'var(--secondary)', borderTop: '2px solid var(--border)', background: 'var(--muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  <span className="text-base font-black">+</span>
                  {t.addCustom}
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderTop: '2px solid var(--border)', background: 'var(--muted)' }}>
                  <input
                    autoFocus
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustom(); if (e.key === 'Escape') { setShowCustomInput(false); setCustomInput(''); } }}
                    placeholder={t.customTitlePlaceholder}
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm font-semibold outline-none"
                    style={{ background: 'var(--card)', border: '2px solid var(--secondary)', color: 'var(--foreground)' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    disabled={!customInput.trim()}
                    className="px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer disabled:opacity-40"
                    style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', border: '2px solid var(--border)' }}
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div
        className="rounded-xl px-4 py-3.5 flex items-center gap-3"
        style={{ background: 'var(--muted)', border: '2px solid var(--secondary)', boxShadow: '3px 3px 0px var(--secondary)' }}
      >
        <span className="text-base flex-shrink-0" style={{ color: 'var(--secondary)' }}>✦</span>
        <div>
          <div className="text-[9px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color: 'var(--secondary)' }}>
            {t.aiGreetingPreview}
          </div>
          <div className="text-sm font-extrabold" style={{ color: 'var(--foreground)' }}>
            {customTitle} {previewName}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={!fullName.trim() && !username.trim()}
        className="w-full py-3.5 rounded-xl font-extrabold text-sm transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background: saved ? '#dcfce7' : 'var(--primary)',
          color: saved ? '#16a34a' : 'var(--primary-foreground)',
          border: `3px solid ${saved ? '#16a34a' : 'var(--border)'}`,
          boxShadow: saved ? '3px 3px 0px #16a34a' : '4px 4px 0px var(--border)',
        }}
      >
        {saved ? (
          <><Icon name="CheckIcon" size={16} />{t.profileSaved}</>
        ) : (
          <><Icon name="UserIcon" size={16} />{t.saveProfile}</>
        )}
      </button>
    </div>
  );
}

// ─── ONBOARDING MODE ─────────────────────────────────────────────────────────

function OnboardingProfile() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [customTitle, setCustomTitle] = useState(getTitlesForGender('male')[0]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const profile = loadProfile();
    if (profile) {
      setFullName(profile.fullName);
      setUsername(profile.username);
      setGender(profile.gender);
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setCustomTitle(profile.customTitle || getTitlesForGender(profile.gender)[0]);
    }
  }, []);

  const handleSave = () => {
    if (!fullName.trim() && !username.trim()) return;
    saveProfile({ fullName, username, gender, email, phone, customTitle });
    setSaved(true);
    setStep(2);
  };

  const handleEnterDashboard = () => {
    router.push('/dashboard');
  };

  // Step 0: Welcome screen
  if (step === 0) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center px-6 halftone-bg overflow-y-auto"
        style={{ background: 'var(--background)' }}
      >
        <div
          className="w-full max-w-sm rounded-3xl overflow-hidden text-center flex-shrink-0"
          style={{
            background: 'var(--card)',
            border: '3px solid var(--border)',
            boxShadow: '8px 8px 0px var(--border)',
          }}
        >
          {/* Crown banner */}
          <div
            className="px-8 pt-10 pb-8"
            style={{ background: 'var(--primary)', borderBottom: '3px solid var(--border)' }}
          >
            <div className="text-6xl mb-4">♛</div>
            <h1 className="font-comic text-3xl font-black tracking-wide" style={{ color: 'var(--primary-foreground)' }}>
              {t.welcomeTitle}
            </h1>
            <p className="text-sm font-semibold mt-2 leading-relaxed" style={{ color: 'var(--primary-foreground)', opacity: 0.8 }}>
              {t.welcomeSubtitle}
            </p>
          </div>

          <div className="px-8 py-8 space-y-5">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-2 rounded-full" style={{ background: 'var(--primary)' }} />
              <div className="w-8 h-2 rounded-full" style={{ background: 'var(--muted)' }} />
              <div className="w-8 h-2 rounded-full" style={{ background: 'var(--muted)' }} />
            </div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
              {t.step1of3}
            </p>

            <div
              className="rounded-2xl px-5 py-4 text-left space-y-2"
              style={{ background: 'var(--muted)', border: '2px solid var(--border)' }}
            >
              <p className="text-sm font-extrabold" style={{ color: 'var(--foreground)' }}>{t.beforeSessionStarts}</p>
              <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {t.beforeSessionDesc}
              </p>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full py-4 rounded-xl font-extrabold text-sm cursor-pointer flex items-center justify-center gap-2 transition-all"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: '3px solid var(--border)',
                boxShadow: '4px 4px 0px var(--border)',
              }}
            >
              <span>{t.startProfileSetup}</span>
              <Icon name="ArrowRightIcon" size={16} />
            </button>

            <button
              onClick={handleEnterDashboard}
              className="w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all"
              style={{ color: 'var(--muted-foreground)', background: 'transparent', border: 'none' }}
            >
              {t.skipForNow}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Done screen
  if (step === 2) {
    const previewName = fullName.trim() || username.trim() || '...';
    return (
      <div
        className="h-screen flex flex-col items-center justify-center px-6 halftone-bg overflow-y-auto"
        style={{ background: 'var(--background)' }}
      >
        <div
          className="w-full max-w-sm rounded-3xl overflow-hidden text-center flex-shrink-0"
          style={{
            background: 'var(--card)',
            border: '3px solid var(--border)',
            boxShadow: '8px 8px 0px var(--border)',
          }}
        >
          <div
            className="px-8 pt-10 pb-8"
            style={{ background: '#16a34a', borderBottom: '3px solid var(--border)' }}
          >
            <div className="text-6xl mb-4">✅</div>
            <h1 className="font-comic text-2xl font-black tracking-wide text-white">
              {t.profileReady}
            </h1>
            <p className="text-sm font-semibold mt-2 text-white opacity-90">
              {t.welcomeUser}, {customTitle} {previewName}
            </p>
          </div>

          <div className="px-8 py-8 space-y-5">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-2 rounded-full" style={{ background: '#16a34a' }} />
              <div className="w-8 h-2 rounded-full" style={{ background: '#16a34a' }} />
              <div className="w-8 h-2 rounded-full" style={{ background: '#16a34a' }} />
            </div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#16a34a' }}>
              {t.doneStep}
            </p>

            <div
              className="rounded-2xl px-5 py-4 text-left"
              style={{ background: 'var(--muted)', border: '2px solid var(--border)' }}
            >
              <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {t.aiWillCall} <strong style={{ color: 'var(--foreground)' }}>{customTitle} {previewName}</strong> {t.inEachSession}
              </p>
            </div>

            <button
              onClick={handleEnterDashboard}
              className="w-full py-4 rounded-xl font-extrabold text-sm cursor-pointer flex items-center justify-center gap-2 transition-all"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: '3px solid var(--border)',
                boxShadow: '4px 4px 0px var(--border)',
              }}
            >
              <span>{t.enterDashboard}</span>
              <Icon name="ArrowRightIcon" size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Form
  return (
    <div
      className="h-screen flex flex-col items-center justify-start px-4 py-6 halftone-bg overflow-y-auto"
      style={{ background: 'var(--background)' }}
    >
      {/* Progress bar at top */}
      <div className="w-full max-w-md mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
            {t.step2of3}
          </span>
          <button
            onClick={handleEnterDashboard}
            className="text-[10px] font-bold cursor-pointer"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {t.skip}
          </button>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: '66%', background: 'var(--primary)' }} />
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="w-8 h-2 rounded-full" style={{ background: 'var(--primary)' }} />
          <div className="w-8 h-2 rounded-full" style={{ background: 'var(--primary)' }} />
          <div className="w-8 h-2 rounded-full" style={{ background: 'var(--muted)' }} />
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden relative z-10 flex-shrink-0"
        style={{
          background: 'var(--card)',
          border: '3px solid var(--border)',
          boxShadow: '6px 6px 0px var(--border)',
        }}
      >
        {/* Header — distinct onboarding style */}
        <div
          className="px-6 pt-5 pb-4 text-center relative"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            borderBottom: '3px solid var(--border)',
          }}
        >
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2 text-[9px] font-extrabold uppercase tracking-widest"
            style={{ background: 'rgba(0,0,0,0.2)', color: 'var(--primary-foreground)', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            {t.setupInitial}
          </div>
          <div className="flex justify-center mb-2">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--card)', border: '2px solid var(--border)', boxShadow: '3px 3px 0px var(--border)' }}
            >
              <span style={{ fontSize: 20 }}>♛</span>
            </div>
          </div>
          <h1 className="font-comic text-xl font-bold tracking-wide" style={{ color: 'var(--primary-foreground)' }}>
            {t.introduceYourself}
          </h1>
          <p className="text-[11px] font-semibold mt-1 leading-relaxed" style={{ color: 'var(--primary-foreground)', opacity: 0.8 }}>
            {t.introduceDesc}
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-5">
          <ProfileFormFields
            fullName={fullName} setFullName={setFullName}
            username={username} setUsername={setUsername}
            email={email} setEmail={setEmail}
            phone={phone} setPhone={setPhone}
            gender={gender} setGender={setGender}
            customTitle={customTitle} setCustomTitle={setCustomTitle}
            theme={theme} setTheme={setTheme}
            saved={saved}
            onSave={handleSave}
            showTheme={true}
          />
        </div>
      </div>

      <p className="text-[10px] font-semibold mt-5 text-center max-w-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {t.profileDataNote}
      </p>
    </div>
  );
}

// ─── REGULAR PROFILE (via tombol profil) ─────────────────────────────────────

function RegularProfile() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [customTitle, setCustomTitle] = useState(getTitlesForGender('male')[0]);
  const [saved, setSaved] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const profile = loadProfile();
    if (profile) {
      setFullName(profile.fullName);
      setUsername(profile.username);
      setGender(profile.gender);
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setCustomTitle(profile.customTitle || getTitlesForGender(profile.gender)[0]);
    } else {
      setCustomTitle(getTitlesForGender('male')[0]);
    }
    setIsLoaded(true);
  }, []);

  const handleSave = () => {
    if (!fullName.trim() && !username.trim()) return;
    saveProfile({ fullName, username, gender, email, phone, customTitle });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (!isLoaded) return null;

  return (
    <div
      className="h-screen flex flex-col items-center justify-start px-4 py-8 relative overflow-y-auto halftone-bg"
      style={{ background: 'var(--background)' }}
    >
      {/* Back button */}
      <div className="absolute top-5 left-5">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 font-bold transition-colors text-sm cursor-pointer btn-ghost-royal px-3 py-1.5 rounded-lg"
          style={{ color: 'var(--foreground)' }}
        >
          <Icon name="ArrowLeftIcon" size={16} />
          {t.backToDashboard}
        </button>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden relative z-10"
        style={{
          background: 'var(--card)',
          border: '3px solid var(--border)',
          boxShadow: '6px 6px 0px var(--border)',
        }}
      >
        {/* Header — regular edit style */}
        <div
          className="px-8 pt-8 pb-6 text-center"
          style={{
            background: 'var(--card)',
            borderBottom: '3px solid var(--border)',
          }}
        >
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 text-[9px] font-extrabold uppercase tracking-widest"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '2px solid var(--border)' }}
          >
            <Icon name="PencilIcon" size={10} />
            {t.editProfileBadge}
          </div>
          <div className="flex justify-center mb-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--primary)', border: '2px solid var(--border)', boxShadow: '3px 3px 0px var(--border)' }}
            >
              <span style={{ fontSize: 24 }}>♛</span>
            </div>
          </div>
          <h1 className="font-comic text-2xl font-bold tracking-wide" style={{ color: 'var(--foreground)' }}>
            {t.myProfile}
          </h1>
          <p className="text-[11px] font-semibold mt-1.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            {t.myProfileDesc}
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          <ProfileFormFields
            fullName={fullName} setFullName={setFullName}
            username={username} setUsername={setUsername}
            email={email} setEmail={setEmail}
            phone={phone} setPhone={setPhone}
            gender={gender} setGender={setGender}
            customTitle={customTitle} setCustomTitle={setCustomTitle}
            theme={theme} setTheme={setTheme}
            saved={saved}
            onSave={handleSave}
            showTheme={true}
          />
        </div>
      </div>

      <p className="text-[10px] font-semibold mt-5 text-center max-w-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {t.profileDataNote}
      </p>
    </div>
  );
}

// ─── ROOT EXPORT ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const searchParams = useSearchParams();
  const isOnboarding = searchParams?.get('onboarding') === '1';

  return isOnboarding ? <OnboardingProfile /> : <RegularProfile />;
}
