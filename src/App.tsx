import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import LoginPage from './components/Login/LoginPage';
import StudentidInput from './components/createAccount/StudentidInput';
import PasswordInput from './components/createAccount/PasswordInput';
import NameInput from './components/createAccount/NameInput';
import SchoolInputInfo from './components/createAccount/SchoolInfoInput';
import TelNumberInput from './components/createAccount/TelNumberInput';
import SchedulePage from './components/Main/SchedulePage';
import MyPage from './components/Main/MyPage';
import Main from './components/MainPage/Main';
import FlashRunList from './components/FlashRun/FlashRunList';
import FlashRunAdmin from './components/FlashRun/FlashRunAdmin';
import MemberList from './components/FlashRun/MemberList';
import FlashRunMake from './components/FlashRun/FlashRunMake';
import FlashRunDetail from './components/FlashRun/FlashRunDetail';

import { Provider } from 'react-redux';
import { store } from './redux/store';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="max-w-{375px}">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login-page" element={<LoginPage />} />
            <Route path="/student-id" element={<StudentidInput />} />
            <Route path="/password-input" element={<PasswordInput />} /> 
            <Route path='/name-input' element={<NameInput />} />
            <Route path='/school-info' element={<SchoolInputInfo />} />
            <Route path='/telNum-input' element={<TelNumberInput />} />
            <Route path='/schedule-page' element={<SchedulePage />} />
            <Route path='/my-page' element={<MyPage />} />
            <Route path="/main" element={<Main />} />
            <Route path="/run" element={<FlashRunList />} />
            <Route path="/run/post/:postId" element={<FlashRunDetail />} />
            <Route path="/flash-run/user" element={<FlashRunMake />} />
            <Route path='/flash-run/test' element={<MemberList name={'허나원'} number={1} />} />
            
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
