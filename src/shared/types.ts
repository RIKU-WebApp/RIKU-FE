// 다양한 도메인에서 사용되는 타입들을 모아둔 파일

export type RunCategory = 'regular' | 'flash' | 'training' | 'event';

export const titleToKorean: Record<RunCategory, string> = {
  regular: '정규런',
  flash: '번개런',
  training: '훈련',
  event: '행사',
};
