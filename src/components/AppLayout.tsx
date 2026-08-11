'use client';

import React, { useState } from 'react';
import AppSidebar from './AppSidebar';
import AppNavbar from './AppNavbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Navbar — fixed at top */}
      <AppNavbar onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />

      {/* Body: sidebar + main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main className="flex-1 min-w-0 overflow-y-auto" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>{children}</main>
      </div>
    </div>
  );
}