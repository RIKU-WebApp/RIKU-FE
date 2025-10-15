import customAxios from '@shared/lib/customAxios';
import { SignupData } from '@features/auth/types';

//서버에 회원가입 request 진행(POST 요청)
const postSignUpRequest = async (data: SignupData) => {
  //해당 구역에 axios 요청을 진행할 것임(서버에 입력된 회원 정보를 저장해야 함)
  try {
    console.log('data가 뭐임?', data);
    const response = await customAxios.post('/user/signup', data);
    if (response.data.isSuccess === true) {
      // 회원가입 성공
      alert('정상적으로 회원 가입이 완료되었습니다');
      return true; // 해당 boolean 값을 받아서, 기타 로직을 처리한다
    } else if (response.data.isSuccess === false) {
      // 회원가입 실패
      alert(response.data.responseMessage);
      return false;
    }
  } catch (error) {
    // 기타 오류로 인해 회원가입 실패
    alert('예상치 못한 오류가 발생했습니다, 관리자에게 문의하세요. \n 오류 내용: ' + error);
    return false;
  }
};

export default postSignUpRequest;
