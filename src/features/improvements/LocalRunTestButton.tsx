import { useEffect, useState } from 'react';
import customAxios from '@/shared/lib/customAxios';

const labOrigin = /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/;

export default function LocalRunTestButton({ origin }: { origin?: string }) {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const match = /^#run-test=([A-Za-z0-9_-]{43})$/.exec(location.hash);
    if (!origin || !labOrigin.test(origin) || !match) return;
    const abort = new AbortController();
    customAxios.post('/user/local-run-test/ticket', { challenge: match[1] }, { signal: abort.signal })
      .then(({ data }) => {
        if (abort.signal.aborted) return;
        const url = new URL(data.url);
        if (url.origin !== origin || url.pathname !== '/enter') throw new Error('Invalid lab address');
        history.replaceState(history.state, '', location.pathname + location.search);
        location.replace(url.href);
      })
      .catch(() => {
        if (!abort.signal.aborted) setMessage('테스트에 연결하지 못했습니다. 다시 눌러주세요.');
      });
    return () => abort.abort();
  }, [origin]);

  if (!origin || !labOrigin.test(origin)) return null;
  return <div className="w-full max-w-sm">
    <a href={origin + '/start'} referrerPolicy="no-referrer" className="block px-4 py-4 text-lg text-kuDarkGreen">
      로컬 테스트
    </a>
    {message && <p role="status" className="px-4 text-sm">{message}</p>}
  </div>;
}
