import { useEffect, useState } from 'react';
import { Badge, BadgeGrid, Header, errorMessage, request } from './shared';
interface Activity {verifiedKm:number;personalKm:number;badges:Badge[]}
export default function AchievementsPage() {
  const [activity,setActivity]=useState<Activity>();
  const [error,setError]=useState('');
  const load=()=>request<Activity>('get','/user/activity/badges').then(setActivity);
  useEffect(()=>{void load().catch(e=>setError(errorMessage(e)));},[]);
  return <main className="riku-page"><Header title="배지 관리" back="/record/archive"/><section className="riku-section">
    <div className="riku-stats"><div><small>공식 출석 거리</small><strong>{activity?.verifiedKm??0} km</strong></div><div><small>개인 기록 거리</small><strong>{activity?.personalKm??0} km</strong></div></div>
    <h2>배지</h2><BadgeGrid badges={activity?.badges||[]}/>
    {error&&<p role="alert" className="riku-error">{error}</p>}
  </section></main>;
}
