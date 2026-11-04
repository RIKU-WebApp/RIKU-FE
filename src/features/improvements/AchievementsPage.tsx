import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, BadgeGrid, Header, errorMessage, request } from './shared';
interface RunRecord {id:number;title:string;date:string;distanceKm:number;minutes:number}
interface Activity {verifiedKm:number;personalKm:number;badges:Badge[];records:RunRecord[]}
export default function AchievementsPage() {
  const navigate=useNavigate();
  const [activity,setActivity]=useState<Activity>();
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [saved,setSaved]=useState(false);
  const load=()=>request<Activity>('get','/user/activity/badges').then(setActivity);
  useEffect(()=>{void load().catch(e=>setError(errorMessage(e)));},[]);
  return <main className="riku-page"><Header title="배지 관리" back="/record/archive"/><section className="riku-section">
    <div className="riku-stats"><div><small>공식 출석 거리</small><strong>{activity?.verifiedKm??0} km</strong></div><div><small>개인 기록 거리</small><strong>{activity?.personalKm??0} km</strong></div></div>
    <h2>배지</h2><BadgeGrid badges={activity?.badges||[]}/>
    <div className="riku-card"><h3>개인 기록 추가</h3>
      <form className="riku-form" onSubmit={async e=>{
        e.preventDefault();const form=e.currentTarget;const values=new FormData(form);setBusy(true);setError('');setSaved(false);
        try{await request<RunRecord>('post','/user/records',{title:values.get('title'),date:values.get('date'),distanceKm:Number(values.get('distanceKm')),minutes:Number(values.get('minutes'))});await load();form.reset();setSaved(true);}
        catch(e){setError(errorMessage(e));}finally{setBusy(false);}
      }}>
        <label>제목<input name="title" required maxLength={80}/></label>
        <label>날짜<input name="date" type="date" required max={new Date().toLocaleDateString('en-CA')} defaultValue={new Date().toLocaleDateString('en-CA')}/></label>
        <div className="riku-row"><label>거리 (km)<input name="distanceKm" type="number" min={0.1} max={200} step={0.1} required/></label><label>시간 (분)<input name="minutes" type="number" min={1} max={2880} required/></label></div>
        <button className="riku-primary" disabled={busy}>저장</button>
      </form>
      {saved&&<p role="status" className="riku-muted">저장되었습니다.</p>}
    </div>
    <h2>내 기록</h2>{activity?.records.map(record=><article className="riku-card" key={record.id}>
      <p className="riku-muted">{record.date}</p><h3>{record.title}</h3><p>{record.distanceKm}km {record.minutes}분</p>
      <div className="riku-inline-actions"><button className="riku-secondary" onClick={()=>navigate('/record',{state:{record}})}>기록증 만들기</button>
        <button className="riku-link" disabled={busy} onClick={async()=>{
          if(!window.confirm('기록을 삭제하시겠습니까?'))return;setBusy(true);setError('');
          try{await request('delete',`/user/records/${record.id}`);await load();}catch(e){setError(errorMessage(e));}finally{setBusy(false);}
        }}>삭제</button></div>
    </article>)}
    {error&&<p role="alert" className="riku-error">{error}</p>}
  </section></main>;
}
