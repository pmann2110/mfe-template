'use client';

import { Outlet } from 'react-router-dom';
import { IdentityNav } from './IdentityNav';
import { useIsPlatformMode } from '../context/IdentityModeContext';

export function IdentityLayout() {
  const isPlatformMode = useIsPlatformMode();

  return (
    <div className="space-y-0">
      {!isPlatformMode && <IdentityNav />}
      <Outlet />
    </div>
  );
}
