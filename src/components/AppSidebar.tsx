'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Icon from '@/components/ui/AppIcon';
import { useLanguage } from '@/components/LanguageProvider';

const recentSessions = [
  { id: 'sess-001', title: 'AI Catalog Tool', date: '10 Agu' },
  { id: 'sess-002', title: 'RanzAI Pricing', date: '08 Agu' },
  { id: 'sess-003', title: 'Downloader MVP', date: '05 Agu' },
  { id: 'sess-004', title: 'Strategi Produk', date: '01 Agu' },
  { id: 'sess-005', title: 'Brand Identity', date: '28 Jul' },
];

interface AppSidebarProps {
  collapsed: boolean;
}

export default function AppSidebar({ collapsed }: AppSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/dashboard', label: t.currentSession, icon: 'TableCellsIcon' as const },
    { href: '/session-history', label: t.sessionHistory, icon: 'ClockIcon' as const },
    { href: '/profile', label: t.kingProfile, icon: 'UserCircleIcon' as const },
    { href: '/settings', label: t.settings, icon: 'Cog6ToothIcon' as const },
  ];

  return (
    <aside
      className="sidebar-bg flex flex-col h-full overflow-hidden z-20 transition-all duration-300 flex-shrink-0"
      style={{ width: collapsed ? 60 : 240, minWidth: collapsed ? 60 : 240 }}
    >
      {/* Section label — sidebar open/close is controlled from the navbar toggle */}
      {!collapsed && (
        <div
          className="flex items-center px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '2px solid var(--muted)' }}
        >
          <span className="text-[10px] font-extrabold tracking-widest uppercase" style={{ color: 'var(--muted-foreground)' }}>
            {t.menu}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="px-2 pt-3 pb-2">
        {!collapsed && (
          <p className="text-[9px] font-extrabold tracking-[0.14em] uppercase px-2 mb-2" style={{ color: 'var(--muted-foreground)' }}>
            {t.navigation}
          </p>
        )}
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={`nav-${item.href}`}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                    isActive ? 'nav-active' : 'nav-hover cursor-pointer'
                  } ${collapsed ? 'justify-center' : ''}`}
                  style={{ color: isActive ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    name={item.icon}
                    size={16}
                    style={{ color: isActive ? 'var(--primary-foreground)' : 'var(--muted-foreground)', flexShrink: 0 }}
                  />
                  {!collapsed && item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Recent Sessions — hidden when collapsed */}
      {!collapsed && (
        <div className="px-3 pt-3 flex-1 overflow-hidden">
          <p className="text-[9px] font-extrabold tracking-[0.14em] uppercase px-2 mb-2" style={{ color: 'var(--muted-foreground)' }}>
            {t.recentSessions}
          </p>
          <ul className="space-y-0.5 overflow-y-auto scrollbar-royal max-h-[200px]">
            {recentSessions.map((session) => (
              <li key={session.id}>
                <Link
                  href="/session-history"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold nav-hover cursor-pointer transition-all duration-150 group"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"
                      style={{ background: 'var(--primary)', border: '1.5px solid var(--border)' }}
                    />
                    <span className="truncate">{session.title}</span>
                  </div>
                  <span className="text-[9px] flex-shrink-0 ml-1 font-bold" style={{ color: 'var(--muted-foreground)' }}>
                    {session.date}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom User */}
    </aside>
  );
}