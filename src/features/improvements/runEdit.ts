import { useRef } from 'react';
import { utcDate } from './shared';

export function useOriginalRunFields() {
  const original = useRef<{start: Date; photos: string[]}>();
  function load(date: string, photos?: string[]) {
    const start = utcDate(date);
    original.current = { start, photos: [...(photos ?? [])] };
    return {date: start, time: start.toTimeString().slice(0,5)};
  }
  function appendDate(data: FormData, date: Date, time: string) {
    const selected = new Date(date);
    const [h,m] = time.split(':').map(Number);
    selected.setHours(h,m,0,0);
    if (Math.floor(selected.getTime()/60000) !== Math.floor((original.current?.start.getTime() ?? 0)/60000))
      data.append('date', selected.toISOString().slice(0,19));
  }
  function changedPhotos(photos: string[]) {
    const prev = original.current?.photos;
    return prev === undefined || prev.length !== photos.length || photos.some((s,i) => s !== prev[i]);
  }
  return {load, appendDate, changedPhotos};
}
