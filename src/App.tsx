import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Main from './components/MainPage/Main.tsx';
import FlashRunList from './components/FlashRun/FlashRunList.tsx';
import FlashRunAdmin from './components/FlashRun/FlashRunAdmin';
import React from 'react';
import MemberList from './components/FlashRun/MemberList.tsx';


function App() {
  return(
    <Router>
      <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/flash-run" element={<FlashRunList/>} />
          <Route path="/flash-run/admin" element={<FlashRunAdmin />} />
          <Route path='/flash-run/test' element={<MemberList name={'허나원'} number={1}/>}/>
      </Routes>
    </Router>
  )
}

export default App
