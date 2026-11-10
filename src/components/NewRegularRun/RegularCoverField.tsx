import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import imageCompression from 'browser-image-compression';
import ListEventCard from '../common/ListEventCard';

type Props = {
  title: string;
  dateTime: { date: Date | null; time: string };
  savedImage?: string | null;
  participants?: number;
  showFullImage: boolean;
  onFitChange: (full: boolean) => void;
  onFileChange: (file: File | null) => void;
  onBusyChange: (busy: boolean) => void;
};

export default function RegularCoverField({ title, dateTime, savedImage, participants = 0,
  showFullImage, onFitChange, onFileChange, onBusyChange }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!file) return;
    let active = true;
    imageCompression(file, { maxSizeMB: 5, maxWidthOrHeight: 1000, useWebWorker: true })
      .then(compressed => { if (active) onFileChange(compressed); })
      .catch(() => {
        if (active) { setFile(null); alert('대표 사진을 불러오지 못했습니다. 다시 선택해주세요.'); }
      })
      .finally(() => { if (active) onBusyChange(false); });
    return () => { active = false; };
  }, [file, onFileChange, onBusyChange]);

  function selectFile(next: File | null) {
    onBusyChange(Boolean(next));
    onFileChange(null);
    setFile(next);
  }
  const image = preview || savedImage;
  return <div className="my-4">
    <div className="flex items-center justify-between gap-3 mb-2">
      <label htmlFor="mainImageUpload" className="font-medium">대표 사진 (필수)</label>
      {image && <div className="flex gap-3 text-sm">
        <label htmlFor="mainImageUpload" className="cursor-pointer text-kuDarkGreen">사진 변경</label>
        {file && <button type="button" onClick={() => selectFile(null)}>{savedImage ? '변경 취소' : '삭제'}</button>}
      </div>}
    </div>
    <input type="file" className="sr-only peer" id="mainImageUpload" accept="image/*"
      onChange={e => { const next = e.target.files?.[0]; e.target.value = ''; if (next) selectFile(next); }} />
    {image ? <>
      <fieldset className="mb-3 flex gap-1 rounded-lg bg-kuLightGray p-1">
        <legend className="sr-only">목록 사진 표시 방식</legend>
        {[false, true].map(full => <label key={String(full)} className="flex-1 cursor-pointer text-center">
          <input type="radio" name="cover-fit" className="peer sr-only" checked={showFullImage === full} onChange={() => onFitChange(full)} />
          <span className="block rounded-md py-2 text-sm peer-checked:bg-white peer-checked:text-kuDarkGreen peer-checked:font-semibold peer-focus-visible:ring-2">
            {full ? '원본 전체' : '가로로 채우기'}
          </span>
        </label>)}
      </fieldset>
      <div aria-label="목록 미리보기">
        <ListEventCard showFullImage={showFullImage} location={title || '정규런'} postimg={image}
          runState="NOW" participants={participants} date={dateTime.date ? format(dateTime.date, 'MM/dd EEEE', {locale: ko}) : '날짜'}
          time={dateTime.time} />
      </div>
    </> : <label htmlFor="mainImageUpload" className="flex h-[104px] w-[104px] cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-400 text-gray-500 peer-focus-visible:ring-2" aria-label="대표 사진 선택">+</label>}
  </div>;
}
