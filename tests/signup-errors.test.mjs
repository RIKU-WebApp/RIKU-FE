import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { after, test } from 'node:test';
import { AxiosError } from 'axios';
import { createServer } from 'vite';

const vite = await createServer({
  server: { middlewareMode: true, hmr: { server: createHttpServer() } },
  appType: 'custom',
  logLevel: 'error',
});
after(() => vite.close());
globalThis.localStorage = { getItem: () => null };
const { default: client } = await vite.ssrLoadModule('/src/shared/lib/customAxios.ts');
const { default: signup } = await vite.ssrLoadModule('/src/features/auth/api/postSignUpRequest.ts');

for (const [status, fieldName, step, message] of [
  [409, 'phone', 5, '이미 등록된 전화번호입니다.'],
  [400, 'major', 4, '학과는 필수 항목입니다.'],
]) {
  test(`HTTP ${status} 오류를 수정할 입력 단계와 메시지로 전달한다`, async () => {
    client.defaults.adapter = async (config) => {
      const data = {
        isSuccess: false,
        responseMessage: '요청 값이 잘못되었습니다.',
        result: { errors: [{ fieldName, message }] },
      };
      throw new AxiosError('Request failed', undefined, config, null, {
        status,
        config,
        data,
        headers: {},
        statusText: '',
      });
    };
    const problem = await signup({});
    assert.equal(problem.step, step);
    assert.ok(problem.message.includes(message));
  });
}

test('구버전 서버의 HTTP 200 학번 중복 응답에서도 학번을 수정할 수 있다', async () => {
  client.defaults.adapter = async (config) => ({
    config,
    status: 200,
    data: { isSuccess: false, responseCode: 2012 },
  });
  assert.equal((await signup({})).step, 1);
});
