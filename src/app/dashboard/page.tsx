'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import CouncilSessionScreen from '../components/CouncilSessionScreen';
import DashboardTourGuide from '@/components/DashboardTourGuide';

export default function DashboardPage() {
  return (
    <AppLayout>
      <CouncilSessionScreen />
      <DashboardTourGuide />
    </AppLayout>
  );
}
