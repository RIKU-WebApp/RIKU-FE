import { Link } from 'react-router-dom';
import { previewFeaturesEnabled } from '../../shared/config/features';
import { Header } from './shared';

export default function RecordArchive() {
  const row = 'flex min-h-14 items-center justify-between px-4 py-3';
  const badgeLabel = <><span>배지 관리</span><small className="text-kuDarkGray">개발 중</small></>;

  return (
    <main className="riku-page">
      <Header title="기록소" />
      <section className="m-4 divide-y divide-kuLightGray rounded-lg border border-kuLightGray">
        <Link className={row} to="/record">기록증 만들기</Link>
        {previewFeaturesEnabled && <Link className={row} to="/record/saved">내 기록</Link>}
        <Link className={row} to="/my-achievements">{badgeLabel}</Link>
      </section>
    </main>
  );
}
