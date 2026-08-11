import React from 'react';
import AppLayout from '@/components/AppLayout';
import SettingsScreen from './components/SettingsScreen';

export default function Page() {
  return (
    <AppLayout>
      <SettingsScreen />
    </AppLayout>
  );
}