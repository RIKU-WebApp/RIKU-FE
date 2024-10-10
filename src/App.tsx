import {useState} from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  //Form에서 입력하는 
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    name: '',
    school: '',
    phone: '',
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
