'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useLanguage } from '@/components/LanguageProvider';
import { SUPPORTED_LANGUAGES } from '@/lib/language';

interface AppNavbarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export default function AppNavbar({ onToggleSidebar, sidebarCollapsed }: AppNavbarProps) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const routeLabels: Record<string, string> = {
    '/': t.routeHome,
    '/session-history': t.routeSessionHistory,
    '/profile': t.routeProfile,
    '/settings': t.routeSettings,
    '/dashboard': t.routeDashboard,
  };

  const pageLabel = routeLabels[pathname] ?? 'King Decision';
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.value === language)!;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="flex items-center gap-3 px-4 h-14 flex-shrink-0 z-30"
      style={{
        background: 'var(--background)',
        borderBottom: '3px solid var(--border)',
        boxShadow: '0 2px 0px var(--border)',
      }}
    >
      {/* Sidebar toggle button */}
      <button
        data-tour="sidebar-toggle"
        onClick={onToggleSidebar}
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 hover:scale-105 active:scale-95"
        style={{
          background: 'var(--primary)',
          border: '2px solid var(--border)',
          boxShadow: '2px 2px 0px var(--border)',
          color: 'var(--primary-foreground)',
        }}
        title={sidebarCollapsed ? t.openSidebar : t.closeSidebar}
      >
        <Icon name={sidebarCollapsed ? 'Bars3Icon' : 'XMarkIcon'} size={18} />
      </button>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
          style={{ background: 'var(--primary)', border: '2px solid var(--border)', boxShadow: '2px 2px 0px var(--border)' }}
        >
          <span style={{ fontSize: 16, color: 'var(--primary-foreground)' }}>♛</span>
        </div>
        <div className="hidden sm:flex flex-col leading-none">
          <span className="font-comic text-sm font-bold" style={{ color: 'var(--foreground)' }}>KING</span>
          <span className="font-comic text-sm font-bold" style={{ color: 'var(--secondary)' }}>DECISION</span>
        </div>
      </Link>

      {/* Divider */}
      <div className="w-px h-6 flex-shrink-0" style={{ background: 'var(--muted)' }} />

      {/* Current page label */}
      <span className="text-sm font-bold truncate" style={{ color: 'var(--muted-foreground)' }}>
        {pageLabel}
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Language Dropdown */}
      <div ref={langRef} className="relative flex-shrink-0">
        <button
          onClick={() => setLangOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-2.5 h-9 rounded-xl text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95"
          style={{
            background: 'var(--muted)',
            border: '2px solid var(--border)',
            boxShadow: '2px 2px 0px var(--border)',
            color: 'var(--foreground)',
          }}
          title={t.language}
        >
          <span className="text-base leading-none">{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.label}</span>
          <Icon name="ChevronDownIcon" size={12} style={{ color: 'var(--muted-foreground)' }} />
        </button>

        {langOpen && (
          <div
            className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50 min-w-[130px]"
            style={{
              background: 'var(--card)',
              border: '2px solid var(--border)',
              boxShadow: '4px 4px 0px var(--border)',
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isActive = lang.value === language;
              return (
                <button
                  key={lang.value}
                  onClick={() => { setLanguage(lang.value); setLangOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold transition-all duration-100 hover:opacity-80"
                  style={{
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? 'var(--primary-foreground)' : 'var(--foreground)',
                  }}
                >
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {isActive && <span className="ml-auto text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile button */}
      <Link
        href="/profile"
        data-tour="profile-btn"
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 hover:scale-110 active:scale-95"
        style={{
          background: 'var(--primary)',
          border: '2px solid var(--border)',
          boxShadow: '2px 2px 0px var(--border)',
          color: 'var(--primary-foreground)',
          fontSize: 18,
        }}
        title={t.profileTitle}
      >
        ♛
      </Link>
    </header>
  );
}
