import { Suspense } from 'react';
import ProfileScreen from './components/ProfileScreen';

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileScreen />
    </Suspense>
  );
}
