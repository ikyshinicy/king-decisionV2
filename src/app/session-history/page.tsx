import React from 'react';
import AppLayout from '@/components/AppLayout';
import SessionHistoryScreen from './components/SessionHistoryScreen';

export default function Page() {
  return (
    <AppLayout>
      <SessionHistoryScreen />
    </AppLayout>
  );
}