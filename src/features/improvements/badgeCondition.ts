type BadgeSeries = {
  id: string;
  name: string;
  rule: string;
  levels: number[];
  unit: string;
  conditions?: string[];
};

export function minimumTarget(target: number, unit: string) {
  const suffix = unit === 'km' ? ' km' : unit === '계절' ? '개 계절' : unit;
  return `최소 ${target.toLocaleString('ko-KR')}${suffix}`;
}

export function badgeCondition(series: BadgeSeries, grade: number) {
  const target = minimumTarget(series.levels[grade], series.unit);
  if ((series.id === 'kinds' || series.id === 'fourSeasons') && series.conditions?.[grade]) return series.conditions[grade];
  switch (series.id) {
    case 'visits': return `마감된 클럽 모임에 ${target} 출석`;
    case 'REGULAR':
    case 'FLASH':
    case 'TRAINING':
    case 'EVENT': return `${series.name} ${target} 출석`;
    case 'months': return `모임에 출석한 달이 누적 ${target}`;
    case 'streak': return `${target} 연속으로 매주 모임 출석`;
    case 'weekends': return `주말 모임 ${target} 출석`;
    case 'leads': return `페이서로 ${target} 출석`;
    case 'hosted': return `다른 부원이 출석한 모임을 ${target} 주최하고 마감`;
    case 'kinds': return `정규런·번개런·훈련·행사 중 ${target} 출석`;
    case 'verifiedKm': return `출석한 그룹의 공식 거리 합계 ${target}`;
    case 'personalKm': return `개인 러닝 기록 합계 ${target}`;
    case 'checkins': return `마이페이지 출석 체크 누적 ${target}`;
    case 'fourSeasons': return `봄·여름·가을·겨울 중 ${target}에 출석`;
    case 'certificateDays': return '직접 만든 기록증을 기록소에 최소 1장 보관';
    default: return series.conditions?.[grade] ?? `${series.rule} (${target})`;
  }
}
