import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SchedulePage from '../components/Main/SchedulePage';
import MyPage from '../components/Main/MyPage';
import FlashRunMake from '../components/FlashRun/FlashRunMake';
import FlashRunDetail from '../components/FlashRun/FlashRunDetail';
import LoginPage from '../components/Login/LoginPage';
import StudentidInput from '../components/createAccount/StudentidInput';
import PasswordInput from '../components/createAccount/PasswordInput';
import NameInput from '../components/createAccount/NameInput';
import SchoolInputInfo from '../components/createAccount/SchoolInfoInput';
import TelNumberInput from '../components/createAccount/TelNumberInput';
import TabNavigationUI from '../components/TabNavigationUI';

import NewMain from '../components/MainPage/NewMain';
import AdminPage from '../components/AdminPage/AdminPage';

import { Provider } from 'react-redux';
import { store } from '../redux/store';

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
import OnbordingPage from '../OnBoradingPage';
import RunList from '../components/common/RunList';

import RecordPage from '../components/RecordPage';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-w-{375px} max-w-full font-AppleSDGothicNeo overflow-y-auto">
          <Routes>
            <Route path="/" element={<OnbordingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/student-id" element={<StudentidInput />} />
            <Route path="/password-input" element={<PasswordInput />} />
            <Route path="/name-input" element={<NameInput />} />
            <Route path="/school-info" element={<SchoolInputInfo />} />
            <Route path="/telNum-input" element={<TelNumberInput />} />

            {/* ProtectedRoute 내부에 들어 있는 Route들은 로그인 안됐는데 url로 이동하지 못하도록 막아놓은 것임 (보안용) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/schedule-page" element={<SchedulePage />} />
              <Route path="/my-page" element={<MyPage />} />
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

              <Route path="/tab/*" element={<TabNavigationUI />} />
              <Route path="/main" element={<NewMain />} />
              <Route path="/:runType" element={<RunList />} />

              <Route path="/regular/edit/:postId" element={<NewRegularRunEdit />} />
              <Route path="/training/edit/:postId" element={<NewTrainingEdit />} />
              <Route path="/flash/edit/:postId" element={<FlashRunEdit />} />
              <Route path="/event/edit/:postId" element={<EventEdit />} />
              <Route path="/profilefix-page" element={<ProfileFixPage />} />
              <Route path="/start" element={<OnbordingPage />} />

              {/* 컴포넌트 테스트 sandbox */}
            </Route>
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
