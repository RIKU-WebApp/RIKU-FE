import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SchedulePage from '../components/Main/SchedulePage';
import MyPage from '../components/Main/MyPage';
import FlashRunMake from '../components/FlashRun/FlashRunMake';
import FlashRunDetail from '../components/FlashRun/FlashRunDetail';
import LoginPage from '../pages/LoginPage';
import MainTabLayout from '@app/layouts/MainTabLayout';
import RankingPage from '@pages/RankingPage';

import NewMain from '../pages/NewMain';
import AdminPage from '../components/AdminPage/AdminPage';

import ProtectedRoute from '../components/ProtectedRoute';

import NewRegularRunMake from '../components/NewRegularRun/NewRegularRunMake';
import EventMake from '../components/NewEvent/EventMake';
import TrainingMake from '../components/NewTraining/TrainingMake';

import NewRegularRunDetail from '../components/NewRegularRun/NewRegularRunDetail';
import NewTrainingDetail from '../components/NewTraining/NewTrainingDetail';
import NewEventDetail from '../components/NewEvent/NewEventDetail';

import NewRegularRunEdit from '../components/NewRegularRun/NewRegularRunEdit';
import NewTrainingEdit from '../components/NewTraining/NewTrainingEdit';
import FlashRunEdit from '../components/FlashRun/FlashRunEdit';
import EventEdit from '../components/NewEvent/EventEdit';

import ProfileFixPage from '../components/Main/ProfileFixPage';
import ActivityDetailPage from '../components/Main/ActivityDetailPage';
import OnbordingPage from '@pages/OnboradingPage';
import RunList from '../components/common/RunList';

import RecordPage from '../components/RecordPage';
import CreateAccountPage from '@pages/CreateAccountPage';
import { CreateAccountProvider } from '@features/auth/context/CreateAccountProvider'; // 회원가입 페이지에 대한 Provider

function App() {
  return (
    <Router>
      <div className="min-w-{375px} max-w-full font-AppleSDGothicNeo overflow-y-auto">
        <Routes>
          <Route path="/" element={<OnbordingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/create-account"
            element={
              <CreateAccountProvider>
                <CreateAccountPage />
              </CreateAccountProvider>
            }
          />

          {/* ProtectedRoute 내부에 들어 있는 Route들은 로그인 안됐는데 url로 이동하지 못하도록 막아놓은 것임 (보안용) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/activity-detail" element={<ActivityDetailPage />} />
            <Route path="/flash/:postId" element={<FlashRunDetail />} />
            <Route path="/regular/:postId" element={<NewRegularRunDetail />} />
            <Route path="/training/:postId" element={<NewTrainingDetail />} />
            <Route path="/event/:postId" element={<NewEventDetail />} />
            <Route path="/record" element={<RecordPage />} />

            <Route path="/admin" element={<AdminPage />} />

            <Route path="/make/flash" element={<FlashRunMake />} />
            <Route path="/make/regular" element={<NewRegularRunMake />} />
            <Route path="/make/event" element={<EventMake />} />
            <Route path="/make/training" element={<TrainingMake />} />

            {/* 메인화면, 일정, 순위, 마이페이지를 오고가는 MainTabLayout 페이지 */}
            <Route path="/tab" element={<MainTabLayout />}>
              <Route index element={<NewMain />} /> {/* /tab → 기본 탭 */}
              <Route path="main" element={<NewMain />} />
              <Route path="schedule-page" element={<SchedulePage />} />
              <Route path="ranking-page" element={<RankingPage />} />
              <Route path="my-page" element={<MyPage />} />
              <Route path=":runType" element={<RunList />} />
            </Route>
            <Route path="/regular/edit/:postId" element={<NewRegularRunEdit />} />
            <Route path="/training/edit/:postId" element={<NewTrainingEdit />} />
            <Route path="/flash/edit/:postId" element={<FlashRunEdit />} />
            <Route path="/event/edit/:postId" element={<EventEdit />} />
            <Route path="/profilefix-page" element={<ProfileFixPage />} />
            <Route path="/start" element={<OnbordingPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
