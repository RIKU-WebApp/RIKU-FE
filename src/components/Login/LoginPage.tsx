import React, { useState } from 'react';
import styled from 'styled-components';

// 모바일 레이아웃 및 조건부 스타일링을 위한 스타일드 컴포넌트
const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  padding: 20px;
  margin: 0 auto;
`;

const Input = styled.input<{ isInvalid: boolean }>`
  padding: 10px;
  font-size: 16px;
  border: 1px solid ${props => (props.isInvalid ? 'red' : '#ccc')};
  border-radius: 4px;
  margin-bottom: 10px;
  width: 100%;
  box-sizing: border-box;
`;

const WarningText = styled.p`
  font-size: 12px;
  color: red;
  margin-top: -10px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  padding: 10px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;


//로그인 페이지 
function LoginPage() {

  

  //비밀번호가 유효한지 확인하기 위한 state
  const [password, setPassword] = useState<string>('');
    

    

}

export default LoginPage;