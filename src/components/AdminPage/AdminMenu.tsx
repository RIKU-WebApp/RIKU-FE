import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { format } from 'date-fns';
import { request } from '../../features/improvements/shared';

export function AdminOnly() {
  const [allowed, setAllowed] = useState<boolean>();
  useEffect(() => {
    let active = true;
    request<{ userRole: string }>('get', '/user/profile?date=' + format(new Date(), 'yyyy-MM-dd'))
      .then(profile => { if (active) setAllowed(profile.userRole === 'ADMIN'); })
      .catch(() => { if (active) setAllowed(false); });
    return () => { active = false; };
  }, []);
  if (allowed === undefined) return null;
  return allowed ? <Outlet /> : <Navigate to="/tab/my-page" replace />;
}
