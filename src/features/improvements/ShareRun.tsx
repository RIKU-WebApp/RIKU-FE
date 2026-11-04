import { useEffect, useState } from 'react';

import homeBanner from '../../assets/main_new.jpg';
import { utcDate } from './shared';
import imageCompression from 'browser-image-compression';

type KakaoSDK = {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (options: unknown) => void;
    uploadImage: (options: { file: FileList }) => Promise<{ infos: { original: { url: string } } }>;
  };
};
// Public RIKU home banner for posts without a cover.
const defaultCover = import.meta.env.PROD
  ? new URL(homeBanner, window.location.origin).href
  : 'https://www.riku.run/assets/main_new-B9hdEni2.jpg';
const schedule = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'long',
  day: 'numeric',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}
let loading: Promise<void> | undefined;
function loadKakao() {
  if (window.Kakao) return Promise.resolve();
  if (!loading)
    loading = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.4/kakao.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => {
        loading = undefined;
        script.remove();
        reject(new Error('카카오 공유를 불러오지 못했습니다.'));
      };
      document.head.appendChild(script);
    });
  return loading;
}
interface Props {
  inline?: boolean;
  title: string;
  path: string;
  location: string;
  date: string;
  imageUrl?: string | null;
}
export default function ShareRun({ title, path, location, date, imageUrl, inline }: Props) {
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState<boolean>();
  const [busy, setBusy] = useState(false);
  const [uploaded, setUploaded] = useState<{ source: string; url: string }>();
  const start = utcDate(date);
  const description = [Number.isFinite(start.getTime()) && schedule.format(start), location]
    .filter(Boolean)
    .join('\n');
  const key = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;
  const url = new URL(path, import.meta.env.VITE_SHARE_BASE_URL || window.location.origin).href;
  useEffect(() => {
    if (key)
      void loadKakao()
        .then(() => {
          if (!window.Kakao!.isInitialized()) window.Kakao!.init(key);
          setReady(true);
        })
        .catch(() => setReady(false));
  }, [key]);
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage('링크를 복사했습니다.');
    } catch {
      setMessage(url);
    }
  }
  async function nativeShare() {
    try {
      if (navigator.share) await navigator.share({ title, text: description, url });
      else {
        await navigator.clipboard.writeText(url);
        setMessage('링크를 복사했습니다.');
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') await copyLink();
    }
  }
  async function share() {
    setMessage('');
    if (!key || !window.Kakao || !ready) return nativeShare();
    const sdk = window.Kakao.Share;
    const link = { webUrl: url, mobileWebUrl: url };
    setBusy(true);
    try {
      let cover = defaultCover;
      if (imageUrl) {
        const source = new URL(imageUrl, window.location.origin);
        if (uploaded?.source === source.href) {
          cover = uploaded.url;
        } else if (['localhost', '127.0.0.1', '[::1]'].includes(source.hostname)) {
          const response = await fetch(source);
          if (!response.ok) throw new Error();
          const blob = await response.blob();
          const transfer = new DataTransfer();
          const file = new File([blob], source.pathname.split('/').pop() || 'cover.jpg', {
            type: blob.type,
          });
          transfer.items.add(
            await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1200 })
          );
          cover = (await sdk.uploadImage({ file: transfer.files })).infos.original.url;
          setUploaded({ source: source.href, url: cover });
          if (navigator.userActivation && !navigator.userActivation.isActive) {
            setMessage('사진이 준비됐습니다. 공유하기를 눌러주세요.');
            return;
          }
        } else if (source.protocol === 'https:' || source.protocol === 'http:') {
          cover = source.href;
        }
      }
      sdk.sendDefault({
        objectType: 'feed',
        content: { title, description, imageUrl: cover, imageWidth: 800, imageHeight: 450, link },
        buttons: [{ title: '자세히 보기', link }],
      });
    } catch {
      setMessage('공유 카드를 열지 못했습니다. 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={inline ? "min-w-0 text-right" : "mb-3 text-right"} data-no-swipe>
      <button
        className="rounded-lg border border-kuDarkGreen px-3 py-1.5 text-sm text-kuDarkGreen"
        disabled={busy || !title || (!!key && ready === undefined)}
        onClick={share}
      >
        공유하기
      </button>
      {message && (
        <p role="status" className="text-xs text-kuDarkGray mt-2 break-all">
          {message}
        </p>
      )}
    </div>
  );
}
