import axios from 'axios';
import customAxios from '@shared/lib/customAxios';
import { AUTH_ENDPOINTS } from '@features/auth/constants';
import { SignupData } from '@features/auth/types';

interface SignupProblem {
  message: string;
  step?: number;
}

const fields: Record<keyof SignupData, [number, string]> = {
  studentId: [1, '학번'],
  password: [2, '비밀번호'],
  name: [3, '이름'],
  college: [4, '단과대학'],
  major: [4, '학과'],
  phone: [5, '전화번호'],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
const readable = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && !value.includes('[object Object]');

function signupProblem(body: unknown, fallback?: unknown): SignupProblem {
  if (isRecord(body)) {
    const errors = isRecord(body.result) ? body.result.errors : null;
    if (Array.isArray(errors)) {
      for (const [key, [step, label]] of Object.entries(fields)) {
        const messages = errors
          .filter(isRecord)
          .filter((e) => e.fieldName === key)
          .map((e) => e.message)
          .filter(readable);
        if (messages.length) return { step, message: label + ' · ' + messages.join(' ') };
      }
    }
    if (body.responseCode === 2012)
      return { step: 1, message: '이미 등록된 학번입니다. 학번을 확인해 주세요.' };
    if (readable(body.responseMessage)) return { message: body.responseMessage };
  }
  return {
    message: readable(fallback)
      ? fallback
      : '회원가입을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  };
}

export default async function postSignUpRequest(data: SignupData): Promise<SignupProblem | null> {
  try {
    const { data: body } = await customAxios.post<unknown>(AUTH_ENDPOINTS.signup, data);
    return isRecord(body) && body.isSuccess === true ? null : signupProblem(body);
  } catch (error) {
    const wrapped = isRecord(error) ? error : {};
    const raw = axios.isAxiosError(error) ? error : wrapped.raw;
    const body = axios.isAxiosError(raw) ? raw.response?.data : undefined;
    return signupProblem(body, wrapped.message);
  }
}
