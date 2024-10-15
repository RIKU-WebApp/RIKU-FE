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

//비밀번호가 유효한지 확인한다
function validatePassword(password: string) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
    return passwordRegex.test(password);
}



//비밀번호 입력 페이지
function PasswordInput() {

    //비밀번호가 유효한지 확인하기 위한 state
    const [password, setPassword] = useState<string>('');
    const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);

    //비밀번호 입력 시 유효성 검사
    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setPassword(value);
        setIsPasswordValid(validatePassword(value)); //validatePassword 함수의 결과로 isPasswordValid 값을 설정한다
    }

    //Form 제출 시 처리하는 함수
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        //Form 제출 로직 추가

        if(isPasswordValid) {
            console.log('폼 제출 완료');
        } else {
            console.log('비밀번호 유효성 검사 실패');
        }
    }

    return (
        <LoginForm onSubmit={handleSubmit}>

        </LoginForm>
    )

}

export default PasswordInput;