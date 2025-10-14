import React, { useMemo, useRef, useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { ko } from 'date-fns/locale';
import { domToBlob } from 'modern-screenshot';
import 'react-day-picker/dist/style.css';

import RikuTextBlack from '../assets/RecordAsset/Riku_text_black.png';
import RikuTextWhite from '../assets/RecordAsset/Riku_text_white.png';
import RikuCowWhite from '../assets/RecordAsset/Riku_cow_white.png';
import RikuCowBlack from '../assets/RecordAsset/Riku_cow_black.png';
import Distance_black from '../assets/RecordAsset/Distance_black.png';
import Distance_white from '../assets/RecordAsset/Distance_white.png';
import Pace_black from '../assets/RecordAsset/Pace_black.png';
import Pace_white from '../assets/RecordAsset/Pace_white.png';
import Time_black from '../assets/RecordAsset/Time_black.png';
import Time_white from '../assets/RecordAsset/Time_white.png';
import Film from '../assets/RecordAsset/film.png'; // 필름 템플릿 배경
import BackIcon from '../assets/BackBtn.svg';
import defalultImg from '../assets/RecordAsset/defaultImg.jpg'; // 기본 이미지

import TemplateAImg from '../assets/RecordAsset/templateA.jpeg';
import TemplateBImg from '../assets/RecordAsset/templateB.jpeg';
import TemplateCImg from '../assets/RecordAsset/templateC.jpeg';
import TemplateDImg from '../assets/RecordAsset/templateD.jpeg';
import TemplateEImg from '../assets/RecordAsset/templateE.jpeg';

/* ===== 타입 ===== */
type RunData = {
  title: string;
  date: string; // YYYY-MM-DD
  timeHH: string;
  timeMM: string;
  timeSS: string;
  paceMM: string; // 분/㎞
  paceSS: string; // 초/㎞
  distanceKm: number; // 자동 계산
  photo?: File | null;
  photoPreview?: string; // Data URL
};
type TemplateType = 'templateA' | 'templateB' | 'templateC' | 'templateD' | 'templateE';
type ThemeBW = 'black' | 'white';

interface ThemeToggleProps {
  value: ThemeBW;
  onChange: (v: ThemeBW) => void;
  label?: string; // 섹션 제목(옵션)
  name: string; // 라디오 그룹명 (페이지 내 유니크)
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ value, onChange, label, name }) => {
  return (
    <fieldset className="mt-4">
      {label && (
        <legend className="mb-2 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
          {label}
        </legend>
      )}

      <div
        className="flex w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
        role="radiogroup"
        aria-label={label || '색상 모드 선택'}
      >
        {/* Black */}
        <label
          className={`group relative flex-1 cursor-pointer px-4 py-2.5 text-center transition
                           ${value === 'black' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50'}`}
        >
          <input
            type="radio"
            name={name}
            value="black"
            checked={value === 'black'}
            onChange={() => onChange('black')}
            className="sr-only"
          />
          <div className="flex items-center justify-center gap-2">
            <span
              className={`h-4 w-4 rounded-full ring-1 ${value === 'black' ? 'ring-white/50' : 'ring-neutral-300'}`}
              style={{ background: '#111' }}
            />
            <span className="text-sm font-medium">Black</span>
          </div>
        </label>

        {/* Divider */}
        <div className="w-px bg-neutral-200" aria-hidden />

        {/* White */}
        <label
          className={`group relative flex-1 cursor-pointer px-4 py-2.5 text-center transition
                           ${value === 'white' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50'}`}
        >
          <input
            type="radio"
            name={name}
            value="white"
            checked={value === 'white'}
            onChange={() => onChange('white')}
            className="sr-only"
          />
          <div className="flex items-center justify-center gap-2">
            <span
              className={`h-4 w-4 rounded-full ring-1 ${value === 'white' ? 'ring-white/50' : 'ring-neutral-300'}`}
              style={{ background: '#fff' }}
            />
            <span className="text-sm font-medium">White</span>
          </div>
        </label>
      </div>
    </fieldset>
  );
};

/* ===== 유틸 ===== */
const hmsToSeconds = (hh: string, mm: string, ss: string) =>
  Number(hh || 0) * 3600 + Number(mm || 0) * 60 + Number(ss || 0);

const paceToSecondsPerKm = (mm: string, ss: string) => Number(mm || 0) * 60 + Number(ss || 0);

const calcDistanceKm = (totalSec: number, paceSecPerKm: number) => {
  if (!paceSecPerKm) return 0;
  return Math.round((totalSec / paceSecPerKm) * 100) / 100;
};

const fmtTime = (hh: string, mm: string, ss: string) =>
  `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;

const fmtPace = (mm: string, ss: string) =>
  `${String(mm).padStart(2, '0')}'${String(ss).padStart(2, '0')}"`;

// "YYYY-MM-DD" → "YYYYMMDD" (Template A 전용)
const fmtDateCompact = (yyyyMmDd: string) => (yyyyMmDd ? yyyyMmDd.replaceAll('-', '') : '');

// YYYY-MM-DD ⇄ Date
const toDateFromYMD = (s: string): Date | null => (s ? new Date(`${s}T00:00:00`) : null);

const toYMD = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/* ===== 메인 ===== */
const RecordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 입력 데이터 상태
  const [run, setRun] = useState<RunData>({
    title: '',
    date: '',
    timeHH: '',
    timeMM: '',
    timeSS: '',
    paceMM: '',
    paceSS: '',
    distanceKm: 0,
    photo: null,
    photoPreview: undefined,
  });

  // 단계, 템플릿, 테마, 이미지 로딩 상태
  const [step, setStep] = useState<1 | 2>(1);
  const [template, setTemplate] = useState<TemplateType>('templateA');
  const [templateBTheme, setTemplateBTheme] = useState<ThemeBW>('black');
  const [templateCTheme, setTemplateCTheme] = useState<ThemeBW>('white');
  const [templateDTheme, setTemplateDTheme] = useState<ThemeBW>('white');
  const [imageReady, setImageReady] = useState<boolean>(true);

  // 거리 자동 계산
  const autoDistance = useMemo(() => {
    const total = hmsToSeconds(run.timeHH, run.timeMM, run.timeSS);
    const pace = paceToSecondsPerKm(run.paceMM, run.paceSS);
    return calcDistanceKm(total, pace);
  }, [run.timeHH, run.timeMM, run.timeSS, run.paceMM, run.paceSS]);

  // 미리보기 캔버스 참조 (640x640)
  const canvasRef = useRef<HTMLDivElement>(null);

  // 파일 인풋 ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 사진 제거
  const handleRemovePhoto = () => {
    setRun((p) => ({ ...p, photo: null, photoPreview: undefined }));
    setImageReady(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 필드 업데이트 헬퍼
  const setField = <K extends keyof RunData>(k: K, v: RunData[K]) =>
    setRun((p) => ({ ...p, [k]: v }));

  // 파일 업로드 처리
  const handlePhotoChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageReady(false);
    const reader = new FileReader();
    reader.onload = () => {
      setRun((prev) => ({ ...prev, photo: file, photoPreview: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  // 다음/이전 단계 이동
  const goNext = () => {
    if (!run.title.trim()) return alert('러닝 제목을 입력해 주세요.');
    if (!run.date) return alert('날짜를 선택해 주세요.');
    setRun((p) => ({ ...p, distanceKm: autoDistance }));
    setStep(2);
  };
  const goPrev = () => setStep(1);

  const EXPORT_SIZE = 640;
  const DPR = 3;

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    if (run.photoPreview && !imageReady) return alert('이미지 로딩 중입니다.');

    // 해상도 업스케일
    const blob = await domToBlob(canvasRef.current!, {
      width: EXPORT_SIZE,
      height: EXPORT_SIZE,
      backgroundColor: '#ffffff',
      scale: DPR,
      style: {
        width: `${EXPORT_SIZE}px`,
        height: `${EXPORT_SIZE}px`,
        transform: 'none',
        transformOrigin: 'top left',
      },
    });

    if (!blob) return;

    const fileName = `riku-record-${run.date || 'run'}.png`;
    const url = URL.createObjectURL(blob);

    // 바로 다운로드
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  // 미리보기 자동 스케일
  const PREVIEW_BASE = 640;
  const previewWrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    // 첫 계산 선적용
    const w = el.clientWidth;
    setScale(Math.min(1, w / PREVIEW_BASE));
  }, [step]); // step===2로 갈 때도 재계산

  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width; // 래퍼의 실제 가로폭
      setScale(Math.min(1, w / PREVIEW_BASE));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="mx-auto max-w-[430px] pt-0">
      <div className="flex items-center justify-center w-full h-[56px] px-5 mb-5 relative bg-kuDarkGreen">
        <div className="text-2xl font-semibold text-white text-center">기록증 만들기</div>
        <button onClick={() => navigate(-1)} className="absolute left-4">
          <img src={BackIcon} alt="뒤로가기" className="w-6 h-6" />
        </button>
      </div>
      {/* 1단계: 입력 */}
      {step === 1 && (
        <section className="space-y-6 p-4 pt-0">
          {/* 제목 */}
          <div>
            <label className="mb-1 block text-sm font-medium">러닝 제목</label>
            <input
              className="w-full rounded-xl border p-3"
              placeholder="예) 뚝섬한강공원런"
              value={run.title}
              onChange={(e) => setField('title', e.target.value)}
            />
          </div>

          {/* 날짜 */}
          <div>
            <label className="mb-1 block text-sm font-medium">날짜</label>

            {/* 트리거 인풋(읽기전용) */}
            <button
              type="button"
              onClick={() => setIsCalendarOpen(true)}
              className="w-full rounded-xl border p-3 text-left hover:bg-gray-50 transition
               flex items-center justify-between"
            >
              <span className={`${run.date ? 'text-gray-900' : 'text-gray-400'}`}>
                {run.date ? run.date : '날짜를 선택하세요'}
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-60">
                <path
                  d="M7 10l5 5 5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* 모달 */}
            {isCalendarOpen && (
              <div className="fixed inset-0 z-50" aria-modal role="dialog">
                {/* 오버레이 */}
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setIsCalendarOpen(false)}
                />

                {/* 패널 */}
                <div
                  className="absolute inset-x-0 bottom-0 w-full max-w-md mx-auto
                      bg-white rounded-t-2xl px-4 pt-6 pb-8 shadow-xl"
                >
                  <div className="mx-auto w-[320px]">
                    <DayPicker
                      mode="single"
                      locale={ko}
                      selected={toDateFromYMD(run.date) || undefined}
                      onSelect={(d) => setField('date', d ? toYMD(d) : '')}
                      classNames={{
                        caption: 'mb-4 text-black',
                        table: 'w-full border-collapse',
                        head_row: 'grid grid-cols-7 text-center text-gray-500 text-sm',
                        head_cell: 'py-2',
                        row: 'grid grid-cols-7',
                        cell: 'w-[40px] h-[40px] text-base text-center text-gray-800 hover:bg-gray-100 rounded-full flex items-center justify-center cursor-pointer',
                        selected: 'bg-kuDarkGreen text-white font-semibold rounded-full',
                        today: 'text-kuDarkGreen font-bold',
                        outside: 'text-gray-300',
                        chevron: 'fill-black',
                        disabled: 'text-gray-300 cursor-not-allowed',
                      }}
                    />
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      disabled={!run.date}
                      onClick={() => setIsCalendarOpen(false)}
                      className={`w-full rounded-lg py-3 text-white
                        ${run.date ? 'bg-kuDarkGreen hover:bg-kuDarkGreen/90' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                      적용하기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 러닝 시간 */}
          <div>
            <label className="mb-1 block text-sm font-medium">러닝 시간</label>
            <div className="flex gap-2">
              <input
                className="w-20 rounded-xl border p-3 text-center"
                value={run.timeHH}
                onChange={(e) => setField('timeHH', e.target.value.replace(/\D/g, ''))}
                placeholder="00"
                maxLength={2}
              />
              <span className="self-center">:</span>
              <input
                className="w-20 rounded-xl border p-3 text-center"
                value={run.timeMM}
                onChange={(e) => setField('timeMM', e.target.value.replace(/\D/g, ''))}
                placeholder="00"
                maxLength={2}
              />
              <span className="self-center">:</span>
              <input
                className="w-20 rounded-xl border p-3 text-center"
                value={run.timeSS}
                onChange={(e) => setField('timeSS', e.target.value.replace(/\D/g, ''))}
                placeholder="00"
                maxLength={2}
              />
            </div>
          </div>

          {/* 페이스 */}
          <div>
            <label className="mb-1 block text-sm font-medium">페이스</label>
            <div className="flex items-center gap-2">
              <input
                className="w-20 rounded-xl border p-3 text-center"
                value={run.paceMM}
                onChange={(e) =>
                  setRun((p) => ({ ...p, paceMM: e.target.value.replace(/\D/g, '') }))
                }
                placeholder="00"
                maxLength={2}
              />
              <span className="self-center">분</span>
              <input
                className="w-20 rounded-xl border p-3 text-center"
                value={run.paceSS}
                onChange={(e) =>
                  setRun((p) => ({ ...p, paceSS: e.target.value.replace(/\D/g, '') }))
                }
                placeholder="00"
                maxLength={2}
              />
              <span className="self-center">초</span>
            </div>
          </div>

          {/* 자동 거리 */}
          <div>
            <label className="mb-1 block text-sm font-medium">거리 (자동계산)</label>
            <input
              className="w-full rounded-xl border bg-gray-50 p-3"
              readOnly
              value={`${autoDistance.toFixed(2)}km`}
            />
          </div>

          {/* 사진 (스타일 버튼 + 미리보기) */}
          <div>
            <label className="mb-2 block text-sm font-medium">사진 첨부</label>

            {/* 트리거 라인 */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed px-4 py-2
                 text-sm hover:bg-gray-50 active:scale-[0.98] transition
                 border-gray-300"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                사진 선택
              </button>

              {run.photoPreview && (
                <>
                  <span className="text-sm text-gray-600 truncate max-w-[160px]">
                    {run.photo?.name}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs text-gray-500 underline hover:text-gray-700"
                  >
                    제거
                  </button>
                </>
              )}
            </div>

            {/* 숨겨진 실제 input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />

            {/* 미리보기 or 힌트 */}
            {run.photoPreview ? (
              <div className="mt-3 relative w-full aspect-square overflow-hidden rounded-xl border border-gray-200">
                <img
                  src={run.photoPreview}
                  alt="선택한 사진 미리보기"
                  className="absolute inset-0 w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
                {/* 우상단 변경 버튼(옵션) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-2 right-2 rounded-md bg-white/80 backdrop-blur px-2 py-1 text-xs hover:bg-white"
                >
                  변경
                </button>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-500">선택하면 아래에 미리보기가 표시됩니다.</p>
            )}
          </div>

          {/* 다음 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={goNext}
              className="rounded-2xl bg-kuDarkGreen px-5 py-3 text-white hover:bg-kuDarkGreen/90 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              템플릿 선택
            </button>
          </div>
        </section>
      )}

      {/* 2단계: 템플릿/미리보기/다운로드 */}
      {step === 2 && (
        <section className="space-y-6 p-4 pt-0">
          {/* 미리보기 래퍼: 정사각형, 내부 스케일 */}
          <div
            ref={previewWrapRef}
            className="mx-auto w-full max-w-[430px] border border-gray-200 bg-slate-400 p-0 relative aspect-square overflow-hidden"
          >
            <div
              id="certificate-canvas"
              ref={canvasRef}
              className="absolute top-0 left-0 bg-white overflow-hidden"
              style={{
                width: PREVIEW_BASE, // 640 고정(다운로드 퀄 유지)
                height: PREVIEW_BASE,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                visibility: scale === 0 ? 'hidden' : 'visible', // 스케일 적용 전 숨김
              }}
            >
              {/* 템플릿 렌더링 */}
              {template === 'templateA' && (
                <TemplateA
                  title={run.title}
                  date={fmtDateCompact(run.date)}
                  time={fmtTime(run.timeHH, run.timeMM, run.timeSS)}
                  pace={fmtPace(run.paceMM, run.paceSS)}
                  distanceKm={run.distanceKm || autoDistance}
                  photoUrl={run.photoPreview || defalultImg}
                  onImageLoad={() => setImageReady(true)}
                  onImageError={() => setImageReady(true)}
                />
              )}
              {template === 'templateB' && (
                <TemplateB
                  title={run.title}
                  date={run.date.replaceAll('-', '_')}
                  time={fmtTime(run.timeHH, run.timeMM, run.timeSS)}
                  pace={fmtPace(run.paceMM, run.paceSS)}
                  distanceKm={run.distanceKm || autoDistance}
                  photoUrl={run.photoPreview || defalultImg}
                  theme={templateBTheme}
                />
              )}
              {template === 'templateC' && (
                <TemplateC
                  date={run.date.replaceAll('-', '.')}
                  time={fmtTime(run.timeHH, run.timeMM, run.timeSS)}
                  pace={fmtPace(run.paceMM, run.paceSS)}
                  distanceKm={run.distanceKm || autoDistance}
                  photoUrl={run.photoPreview || defalultImg}
                  theme={templateCTheme}
                />
              )}
              {template === 'templateD' && (
                <TemplateD
                  title={run.title}
                  date={run.date.replaceAll('-', '.')} // YYYY.MM.DD
                  time={fmtTime(run.timeHH, run.timeMM, run.timeSS)}
                  pace={fmtPace(run.paceMM, run.paceSS)}
                  distanceKm={run.distanceKm || autoDistance}
                  photoUrl={run.photoPreview || defalultImg}
                  theme={templateDTheme}
                />
              )}
              {template === 'templateE' && (
                <TemplateE
                  title={run.title}
                  date={run.date.replaceAll('-', '')} // YYYYMMDD
                  time={fmtTime(run.timeHH, run.timeMM, run.timeSS)}
                  pace={fmtPace(run.paceMM, run.paceSS)}
                  distanceKm={run.distanceKm || autoDistance}
                  photoUrl={run.photoPreview || defalultImg}
                />
              )}
            </div>
          </div>

          {/* 템플릿 선택 */}
          <div className="grid grid-cols-4 gap-4">
            {/* A */}
            <label
              className={`cursor-pointer rounded-xl border p-2 ${template === 'templateA' ? 'ring-2 ring-emerald-600' : ''}`}
            >
              <input
                type="radio"
                name="template"
                className="hidden"
                checked={template === 'templateA'}
                onChange={() => setTemplate('templateA')}
              />
              <img
                src={TemplateAImg}
                alt="템플릿 A 미리보기"
                className="aspect-square w-full rounded-lg object-cover"
              />
            </label>

            {/* E */}
            <label
              className={`cursor-pointer rounded-xl border p-2 ${template === 'templateE' ? 'ring-2 ring-emerald-600' : ''}`}
            >
              <input
                type="radio"
                name="template"
                className="hidden"
                checked={template === 'templateE'}
                onChange={() => setTemplate('templateE')}
              />
              <img
                src={TemplateEImg}
                alt="템플릿 E 미리보기"
                className="aspect-square w-full rounded-lg object-cover"
              />
            </label>

            {/* C */}
            <label
              className={`cursor-pointer rounded-xl border p-2 ${template === 'templateC' ? 'ring-2 ring-emerald-600' : ''}`}
            >
              <input
                type="radio"
                name="template"
                className="hidden"
                checked={template === 'templateC'}
                onChange={() => setTemplate('templateC')}
              />
              <img
                src={TemplateCImg}
                alt="템플릿 C 미리보기"
                className="aspect-square w-full rounded-lg object-cover"
              />
            </label>

            {/* D */}
            <label
              className={`cursor-pointer rounded-xl border p-2 ${template === 'templateD' ? 'ring-2 ring-emerald-600' : ''}`}
            >
              <input
                type="radio"
                name="template"
                className="hidden"
                checked={template === 'templateD'}
                onChange={() => setTemplate('templateD')}
              />
              <img
                src={TemplateDImg}
                alt="템플릿 D 미리보기"
                className="aspect-square w-full rounded-lg object-cover"
              />
            </label>

            {/* B */}
            <label
              className={`cursor-pointer rounded-xl border p-2 ${template === 'templateB' ? 'ring-2 ring-emerald-600' : ''}`}
            >
              <input
                type="radio"
                name="template"
                className="hidden"
                checked={template === 'templateB'}
                onChange={() => setTemplate('templateB')}
              />
              <img
                src={TemplateBImg}
                alt="템플릿 B 미리보기"
                className="aspect-square w-full rounded-lg object-cover"
              />
            </label>
          </div>

          {/* B/C/D 테마 토글 */}
          {template === 'templateB' && (
            <ThemeToggle
              label="Theme"
              name="btheme"
              value={templateBTheme}
              onChange={setTemplateBTheme}
            />
          )}

          {template === 'templateC' && (
            <ThemeToggle
              label="Theme"
              name="ctheme"
              value={templateCTheme}
              onChange={setTemplateCTheme}
            />
          )}

          {template === 'templateD' && (
            <ThemeToggle
              label="Theme"
              name="dtheme"
              value={templateDTheme}
              onChange={setTemplateDTheme}
            />
          )}

          {/* 하단 버튼 */}
          <div className="flex items-center justify-between">
            <button onClick={goPrev} className="rounded-2xl border px-5 py-3 hover:bg-gray-50">
              이전 (데이터 수정)
            </button>
            <button
              onClick={handleDownload}
              disabled={run.photoPreview ? !imageReady : false}
              className={`rounded-2xl px-5 py-3 text-white ${run.photoPreview && !imageReady ? 'bg-gray-400 cursor-not-allowed' : 'bg-kuDarkGreen hover:bg-kuDarkGreen/90'} transition`}
            >
              다운로드
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default RecordPage;

/* ===== 템플릿 A ===== 필름스타일 (1) */
const TemplateA: React.FC<{
  title: string;
  date: string;
  time: string;
  pace: string;
  distanceKm: number;
  photoUrl?: string;
  onImageLoad?: () => void;
  onImageError?: () => void;
}> = ({ title, date, time, pace, distanceKm, photoUrl, onImageLoad, onImageError }) => (
  <div className="relative w-full h-full overflow-hidden bg-white">
    {/* 상단 중앙 제목 */}
    <div
      className="absolute top-[12px] left-24 right-24
                text-[22px] font-paperlogy font-bold text-center
                leading-tight tracking-[0.01em]
               whitespace-nowrap overflow-hidden text-ellipsis break-keep"
    >
      {title || '러닝 제목'}
    </div>

    {/* 우상단 정보 */}
    <div className="absolute right-[29px] top-[46px] z-10 text-[14px] font-semibold w-[160px]">
      <div className="flex justify-between gap-6">
        <span className="underline font-paperlogy font-bold">TIME</span>
        <span className="text-right">{time}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="underline font-paperlogy font-bold">PACE</span>
        <span className="text-right">{pace}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="underline font-paperlogy font-bold">DISTANCE</span>
        <span className="text-right">{distanceKm.toFixed(2)}km</span>
      </div>
    </div>

    {/* 좌상단 서브 카피 */}
    <div className="absolute left-7 top-[43px] z-10 text-[14px] font-paperlogy font-semibold">
      KONKUK. UNIV
      <br />
      <span className="whitespace-nowrap">RUNNING CREW-</span>
    </div>

    {/* 로고 */}
    <img src={RikuTextBlack} alt="RIKU" className="absolute left-6 top-[92px] h-6 w-auto" />

    {/* 사진 영역 */}
    <div className="absolute left-6 right-6 top-[130px] bottom-[76px] overflow-hidden bg-gray-100">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt="run"
          crossOrigin="anonymous"
          onLoad={onImageLoad}
          onError={onImageError}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-500">
          사진을 첨부하면 여기 들어가요
        </div>
      )}
    </div>

    {/* 하단 라인/날짜/로고 */}
    <div className="absolute bottom-6 left-7 text-2xl font-paperlogy font-normal">ㅡ</div>
    <div className="absolute right-6 bottom-6 text-sm font-paperlogy font-bold tracking-wide flex items-center gap-6">
      <span>{date || 'YYYYMMDD'}</span>
      <img src={RikuCowBlack} alt="로고" className="h-6 w-auto" />
    </div>
  </div>
);

/* ===== 템플릿 B  ===== */
const TemplateB: React.FC<{
  title: string;
  date: string;
  time: string;
  pace: string;
  distanceKm: number;
  photoUrl?: string;
  theme?: ThemeBW;
}> = ({ title, date, time, pace, distanceKm, photoUrl, theme = 'black' }) => {
  const isWhite = theme === 'white';
  const logoText = isWhite ? RikuTextWhite : RikuTextBlack;
  const logoCow = isWhite ? RikuCowWhite : RikuCowBlack;
  const icoTime = isWhite ? Time_white : Time_black;
  const icoPace = isWhite ? Pace_white : Pace_black;
  const icoDist = isWhite ? Distance_white : Distance_black;
  const textColor = isWhite ? 'text-white' : 'text-neutral-900';

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 배경 */}
      {photoUrl ? (
        <img
          src={photoUrl}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-300" />
      )}

      {/* 우상단 로고 2개 */}
      <div className="absolute top-4 right-4 flex items-center z-10 gap-3">
        <img src={logoText} alt="logo1" className="h-6 w-auto" />
        <img src={logoCow} alt="logo2" className="h-6 w-auto" />
      </div>

      {/* 좌하단 텍스트/표 */}
      <div className={`absolute left-9 bottom-9 z-10 ${textColor}`}>
        <div className="mb-1 text-sm font-paperlogy font-bold tracking-widest">
          <span>{date || 'YYYY_MM_DD'}</span>
        </div>
        <div
          className="
      mb-4 text-3xl font-paperlogy font-bold leading-tight tracking-[0.01em]
      max-w-[430px] whitespace-nowrap overflow-hidden text-ellipsis
     
    "
        >
          {title || '러닝 제목'}
        </div>

        {/* 기록 표 */}
        <div className="space-y-1 text-sm font-paperlogy font-bold tabular-nums">
          <div className="grid grid-cols-[110px_1fr] items-center gap-x-6">
            <span className="flex items-center gap-2">
              <img className="w-6 h-6 object-contain" src={icoTime} alt="time" />
              <span>TIME</span>
            </span>
            <span className="text-right">{time}</span>
          </div>
          <div className="grid grid-cols-[110px_1fr] items-center gap-x-6">
            <span className="flex items-center gap-2">
              <img className="w-6 h-6 object-contain" src={icoPace} alt="pace" />
              <span>PACE</span>
            </span>
            <span className="text-right">{pace}</span>
          </div>
          <div className="grid grid-cols-[110px_1fr] items-center gap-x-6">
            <span className="flex items-center gap-2">
              <img className="w-6 h-6 object-contain" src={icoDist} alt="DISTANCE" />
              <span>DISTANCE</span>
            </span>
            <span className="text-right">{distanceKm.toFixed(2)}km</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== 템플릿 C ===== */
const TemplateC: React.FC<{
  date: string;
  time: string;
  pace: string;
  distanceKm: number;
  photoUrl?: string;
  theme?: ThemeBW;
}> = ({ date, time, pace, distanceKm, photoUrl, theme = 'white' }) => {
  const isWhite = theme === 'white';
  const logoCow = isWhite ? RikuCowWhite : RikuCowBlack;
  const icoTime = isWhite ? Time_white : Time_black;
  const icoPace = isWhite ? Pace_white : Pace_black;
  const icoDist = isWhite ? Distance_white : Distance_black;
  const textColor = isWhite ? 'text-white' : 'text-neutral-900';

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 배경 */}
      {photoUrl ? (
        <img
          src={photoUrl}
          alt="bg"
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-300" />
      )}

      {/* 상단 중앙 로고 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <img src={logoCow} alt="cow" className="h-6 w-auto" />
      </div>

      {/* 하단 중앙 정보 컨테이너 */}
      <div
        className={`absolute bottom-[70px] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center ${textColor}`}
      >
        {/* 시간 | 거리 | 페이스 */}
        <div className="grid grid-cols-[120px_auto_120px_auto_120px] items-center text-[25px] font-semibold">
          {/* 시간 */}
          <div className="flex items-center justify-center gap-2">
            <img src={icoTime} className="h-5 w-5 object-contain" alt="time" />
            <span className="tabular-nums">{time}</span>
          </div>

          {/* 구분선 */}
          <div className={`w-px h-5 mx-4 ${isWhite ? 'bg-white/50' : 'bg-black/30'}`} />

          {/* 거리 */}
          <div className="flex items-center justify-center gap-2">
            <img src={icoDist} className="h-5 w-5 object-contain" alt="distance" />
            <span className="tabular-nums">{distanceKm.toFixed(2)}</span>
          </div>

          {/* 구분선 */}
          <div className={`w-px h-5 mx-4 ${isWhite ? 'bg-white/50' : 'bg-black/30'}`} />

          {/* 페이스 */}
          <div className="flex items-center justify-center gap-2">
            <img src={icoPace} className="h-5 w-5 object-contain" alt="pace" />
            <span className="tabular-nums">{pace}</span>
          </div>
        </div>

        {/* 날짜 */}
        <div className="absolute bottom-[-45px] text-[16px] font-normal tracking-wide">
          {date || 'YYYY.MM.DD'}
        </div>
      </div>
    </div>
  );
};

/* ===== 템플릿 D  ===== */
const TemplateD: React.FC<{
  title: string;
  date: string; // YYYY.MM.DD
  time: string; // HH:MM:SS
  pace: string; // 05'30"
  distanceKm: number; // 04.23
  photoUrl?: string;
  theme?: ThemeBW; // black | white
}> = ({ title, date, time, pace, distanceKm, photoUrl, theme = 'white' }) => {
  const isWhite = theme === 'white';
  const textColor = isWhite ? 'text-white' : 'text-neutral-900';
  const logoText = isWhite ? RikuTextWhite : RikuTextBlack;
  const logoCow = isWhite ? RikuCowWhite : RikuCowBlack;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 배경 */}
      {photoUrl ? (
        <img
          src={photoUrl}
          alt="bg"
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-300" />
      )}

      {/* 우상단 로고 2개 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        <img src={logoText} alt="RIKU text" className="h-6 w-auto" />
        <img src={logoCow} alt="RIKU cow" className="h-6 w-auto" />
      </div>

      {/* 좌하단 DISTANCE / PACE / TIME */}
      <div className={`absolute left-6 bottom-8 z-10 ${textColor} font-paperlogy font-bold`}>
        {/* DISTANCE */}
        <div className="mb-4">
          <div className="text-[15px] opacity-90 tracking-wide">DISTANCE</div>
          <div className="mt-1 flex items-baseline text-[44px] leading-none tabular-nums">
            <span>{distanceKm.toFixed(2)}</span>
            <span className="ml-1">km</span>
          </div>
        </div>

        {/* PACE */}
        <div className="mb-4">
          <div className="text-[15px] opacity-90 tracking-wide">PACE</div>
          <div className="mt-1 text-[40px] leading-none tabular-nums">{pace}</div>
        </div>

        {/* TIME */}
        <div>
          <div className="text-[15px] opacity-90 tracking-wide">TIME</div>
          <div className="mt-1 text-[40px] leading-none tabular-nums">{time}</div>
        </div>
      </div>

      {/* 우하단 날짜 / 제목 */}
      <div className={`absolute right-6 bottom-8 z-10 ${textColor} text-right`}>
        <div className="text-[13px] font-paperlogy font-bold tracking-wide opacity-90">
          {date || 'YYYY.MM.DD'}
        </div>
        <div
          className="
      mt-2 text-[18px] font-paperlogy font-normal
      max-w-[430px] leading-snug tracking-[0.01em]
      truncate whitespace-nowrap
    "
        >
          {title || '러닝 제목'}
        </div>
      </div>

      {/* 하단 그라데이션 가독성 보강 -> 추후 필요하면 주석 해제*/}
      {/*
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-40
        ${isWhite ? "bg-gradient-to-t from-black/30 to-transparent"
                  : "bg-gradient-to-t from-white/40 to-transparent"}`} />
      */}
    </div>
  );
};

/* ===== 템플릿 E ===== 필름스타일 (2) */
const TemplateE: React.FC<{
  title: string;
  date: string; // YYYYMMDD
  time: string; // HH:MM:SS
  pace: string; // 05'30"
  distanceKm: number; // 04.27
  photoUrl?: string;
}> = ({ title, date, time, pace, distanceKm, photoUrl }) => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      {/* 배경 */}
      <img
        src={Film}
        alt="film frame"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
      />

      {/* 좌상단: RIKU 텍스트 + 제목 */}
      <div className="absolute left-6 top-7 z-10">
        <img src={RikuTextBlack} alt="RIKU" className="h-6 w-auto mb-3" />
        <div
          className="text-[28px] leading-tight font-paperlogy font-bold tracking-tight
                whitespace-nowrap overflow-hidden text-ellipsis break-keep"
        >
          {title || '러닝 제목'}
        </div>
      </div>

      {/* 우상단: 기록 표 */}
      <div className="absolute right-9 top-[34px] z-10 font-paperlogy font-bold tabular-nums">
        <div className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-2 text-[16px] leading-none">
          <span className="tracking-wide opacity-80 text-left">_TIME</span>
          <span className="text-right">{time}</span>

          <span className="tracking-wide opacity-80 text-left">_PACE</span>
          <span className="text-right">{pace}</span>

          <span className="tracking-wide opacity-80 text-left">_DISTANCE</span>
          <span className="text-right">{distanceKm.toFixed(2)}km</span>
        </div>
      </div>

      {/* 중앙 이미지 영역 */}
      <div className="absolute top-[130px] left-[110px] right-[32px] bottom-[65px] overflow-hidden bg-neutral-200">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="run"
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-500">
            사진을 첨부하면 여기 들어가요
          </div>
        )}
      </div>

      {/* 좌하단: 소 로고 */}
      <div className="absolute left-6 bottom-6 z-10">
        <img src={RikuCowBlack} alt="RIKU cow" className="h-7 w-auto" />
      </div>

      {/* 우하단: 날짜 (YYYYMMDD) */}
      <div className="absolute right-9 bottom-6 z-10 text-[16px] font-paperlogy font-bold tracking-wider">
        {date || 'YYYYMMDD'}
      </div>
    </div>
  );
};
