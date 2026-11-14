import axios from 'axios';
import customAxios from '@shared/lib/customAxios';
import { AUTH_ENDPOINTS } from '@features/auth/constants';
import { SignupData } from '@features/auth/types';

export interface SignupProblem {
  message: string;
  step?: number;
}

interface SignupResponse {
  isSuccess?: boolean;
  responseCode?: number;
  responseMessage?: string;
  result?: { errors?: { fieldName: string; message: string }[] };
}

const fields: Record<keyof SignupData, [number, string]> = {
  studentId: [1, '학번'],
  password: [2, '비밀번호'],
  name: [3, '이름'],
  college: [4, '단과대학'],
  major: [4, '학과'],
  phone: [5, '전화번호'],
};

function signupProblem(body?: SignupResponse, fallback?: string): SignupProblem {
  for (const [key, [step, label]] of Object.entries(fields)) {
    const messages = body?.result?.errors
      ?.filter((e) => e.fieldName === key && e.message)
      .map((e) => e.message);
    if (messages?.length) return { step, message: label + ' · ' + messages.join(' ') };
  }
  if (body?.responseCode === 2012)
    return { step: 1, message: '이미 등록된 학번입니다. 학번을 확인해 주세요.' };
  return {
    message:
      body?.responseMessage ||
      fallback ||
      '회원가입을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  };
}

export default async function postSignUpRequest(data: SignupData): Promise<SignupProblem | null> {
  try {
    const { data: body } = await customAxios.post<SignupResponse>(AUTH_ENDPOINTS.signup, data);
    return body.isSuccess === true ? null : signupProblem(body);
  } catch (error) {
    const wrapped = error as { raw?: unknown; message?: string };
    const raw = axios.isAxiosError(error) ? error : wrapped?.raw;
    const body = axios.isAxiosError<SignupResponse>(raw) ? raw.response?.data : undefined;
    return signupProblem(body, wrapped?.message);
  }
}
