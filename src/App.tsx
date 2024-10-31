import {useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

import LoginPage from './components/Login/LoginPage';

import StudentidInput from './components/createAccount/StudentidInput';
import PasswordInput from './components/createAccount/PasswordInput';
import NameInput from './components/createAccount/NameInput';
import SchoolInputInfo from './components/createAccount/SchoolInfoInput';
import TelNumberInput from './components/createAccount/TelNumberInput';

import { Provider } from 'react-redux';
import { store } from './redux/store';

//최상단 컴포넌트
function App() {

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          {/* 라우터 설정 */}
          <Routes>
            <Route path="/" element={<LoginPage />} /> {/* 초기 화면 설정 */}
            <Route path="/login-page" element={<LoginPage />} />
            <Route path="/student-id" element={<StudentidInput />} />
            <Route path="/password-input" element={<PasswordInput/>} /> 
            <Route path='/name-input' element={<NameInput/>} />
            <Route path='/school-info' element={<SchoolInputInfo/>} />
            <Route path='/telNum-input' element={<TelNumberInput/>} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
