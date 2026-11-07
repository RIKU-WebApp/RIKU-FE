import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Image, MessageSquare } from 'lucide-react';
import { earnedItems } from './MemberProfile';
import { request, type Badge } from './shared';
import { previewFeaturesEnabled } from '../../shared/config/features';
import './myBadgePreview.css';
import { type RankMedal, RankPatch, medalPeriod, rankPalette } from './RankMedals';

type BadgePreview = { badges?: Badge[]; medals?: RankMedal[]; medalCount: number };

export default function MyBadgePreview() {
  const [summary, setSummary] = useState<BadgePreview>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    request<BadgePreview>('get', '/user/activity/badge-preview')
      .then(result => { if (active) setSummary(result); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  const preview = summary && earnedItems(summary.badges ?? []);
  const ranks = summary?.medals ?? [];
  return <section className="my-badge-preview w-full max-w-sm">
    <Link to="/my-achievements" className="my-badge-link">
      <div className="my-badge-heading"><h2>내 배지</h2><span>전체 보기 <ChevronRight size={15}/></span></div>
      {ranks.length > 0 && <>
        <div className="my-rank-count">입상 배지 {summary?.medalCount}개</div>
        <div className="my-badge-strip my-rank-strip">{ranks.map(rank =>
          <div key={rank.kind+rank.start} style={{borderTopColor:rankPalette(rank)[1]}}>
            <RankPatch medal={rank}/><strong>{rank.kind === 'MONTH' ? '월간' : '학기'} {rank.place}위</strong>
            <small>{medalPeriod(rank)}</small>
          </div>)}</div>
      </>}
      {preview?.length ? <div className="my-badge-strip">{preview.map(item =>
        <div key={item.key}>{item.art}<span>{item.title}</span></div>)}</div> :
        <p>{failed ? '배지를 불러오지 못했어요.' : preview ? '아직 획득한 배지가 없어요.' : '배지 불러오는 중…'}</p>}
    </Link>
    <div className="my-shortcuts">
      <Link to="/record"><Image size={18}/>기록증 만들기</Link>
      {previewFeaturesEnabled && <Link to="/feedback"><MessageSquare size={18}/>건의사항</Link>}
    </div>
  </section>;
}
