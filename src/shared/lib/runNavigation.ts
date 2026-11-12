import { useEffect } from 'react';
import { useLocation, useNavigate, type NavigateFunction } from 'react-router-dom';
import type { RunCategory } from '@shared/types';

export function goBackOrReplace(navigate: NavigateFunction, fallback: string) {
  if (window.history.state?.idx > 0) navigate(-1);
  else navigate(fallback, { replace: true });
}

export function useRunDetailBack(category: RunCategory) {
  const navigate = useNavigate();
  const location = useLocation();
  const list = '/tab/' + category;

  useEffect(() => {
    // On a shared link, put the category list behind the post for the browser back button.
    if (window.history.state?.idx !== 0) return;
    navigate(list, { replace: true });
    navigate(location.pathname + location.search + location.hash, {
      state: { ...location.state, fromRunList: list },
    });
  }, [location, list, navigate]);

  return () => {
    if (category === 'regular' && location.state?.fromRunList !== list) {
      navigate(list, { replace: true });
    } else {
      goBackOrReplace(navigate, list);
    }
  };
}
