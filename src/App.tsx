import {useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

import LoginPage from './components/Login/LoginPage';

import StudentidInput from './components/createAccount/StudentidInput';
import PasswordInput from './components/createAccount/PasswordInput'


//최상단 컴포넌트
function App() {

  return (
    <Router>
      <div className="App">
        {/* 라우터 설정 */}
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/student-id" element={<StudentidInput />} />
          <Route path="/password-input" element={<PasswordInput/>} /> 
         </Routes>
      </div>
    </Router>
    
  );
}

export default App;
