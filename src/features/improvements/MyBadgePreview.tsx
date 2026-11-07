import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Image, MessageSquare } from 'lucide-react';
import { earnedItems } from './MemberProfile';
import { request, type Badge } from './shared';
import { previewFeaturesEnabled } from '../../shared/config/features';
import './myBadgePreview.css';
import { type RankMedal, RankPatch, medalPeriod, orderedRanks, rankPalette } from './RankMedals';

export default function MyBadgePreview() {
  const [ranks,setRanks] = useState<RankMedal[]>([]);
  const [badges, setBadges] = useState<Badge[]>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    request<RankMedal[]>('get','/user/activity/rank-honors').then(r=>{if(active)setRanks(r);}).catch(()=>{if(active)setFailed(true);});
    request<{badges: Badge[]}>('get', '/user/activity/badges')
      .then(activity => { if (active) setBadges(activity.badges); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  const preview = badges && earnedItems(badges).slice(0, 3);
  return <section className="my-badge-preview w-full max-w-sm">
    <Link to="/my-achievements" className="my-badge-link">
      <div className="my-badge-heading"><h2>내 배지</h2><span>전체 보기 <ChevronRight size={15}/></span></div>
      {ranks.length > 0 && <>
        <div className="my-rank-count">입상 배지 {ranks.length}개</div>
        <div className="my-badge-strip my-rank-strip">{orderedRanks(ranks).slice(0,3).map(rank =>
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
