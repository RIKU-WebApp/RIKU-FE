import customAxios from '@shared/lib/customAxios';
import { AUTH_ENDPOINTS } from '@features/auth/constants';

// 학번 중복 검사 요청하는 api 함수
async function getIsStudentidValidate(studentID: string) {
  try {
    const response = await customAxios.get(AUTH_ENDPOINTS.checkStudentId(studentID));
    //중복 확인 검사 성공했을 경우에만 (result 값이 false여야 함)
    if (response.data.result === false) {
      // alert("학번이 유효합니다! 다음 단계로 넘어갑니다.");
      return true;
    } else {
      //중복 검사 실패 (겹치는 놈 있음)
      alert('이미 가입된 학번입니다. 다른 학번으로 가입을 다시 시도해 주세요.');
      return false;
    }
  } catch {
    alert('학번 중복 여부를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    return false;
  }
}

export default getIsStudentidValidate;
