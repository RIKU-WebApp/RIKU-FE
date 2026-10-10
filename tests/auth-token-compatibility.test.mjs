import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { after, beforeEach, test } from 'node:test';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true, hmr: { server: createHttpServer() } },
  appType: 'custom',
  logLevel: 'error',
});
const auth = await server.ssrLoadModule('/src/features/auth/api/tokenAuth.ts');
const { default: customAxios } = await server.ssrLoadModule('/src/shared/lib/customAxios.ts');
const storedValues = new Map();
let sentAuthorization;

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key) => storedValues.get(key) ?? null,
    setItem: (key, value) => storedValues.set(key, String(value)),
    removeItem: (key) => storedValues.delete(key),
  },
});

customAxios.defaults.adapter = async (config) => {
  sentAuthorization = config.headers.get('Authorization');
  return { config, data: {}, headers: {}, status: 200, statusText: 'OK' };
};

beforeEach(() => {
  storedValues.clear();
  sentAuthorization = undefined;
});
after(() => server.close());

test('기존 운영 앱의 JSON 토큰을 읽으면 현재 저장 형식으로 변환한다', () => {
  storedValues.set('accessToken', JSON.stringify('Bearer legacy-token'));

  assert.equal(auth.getAccessToken(), 'Bearer legacy-token');
  assert.equal(storedValues.get('accessToken'), 'Bearer legacy-token');
  assert.equal(auth.getAccessToken(), 'Bearer legacy-token');
});

test('새 로그인에서 저장한 일반 문자열 토큰도 그대로 읽는다', () => {
  storedValues.set('accessToken', 'Bearer current-token');
  assert.equal(auth.getAccessToken(), 'Bearer current-token');
});

test('이전 형식의 refresh token도 Bearer를 추가하지 않고 읽는다', () => {
  storedValues.set('refreshToken', JSON.stringify('refresh-token'));
  assert.equal(auth.getRefreshToken(), 'refresh-token');
  assert.equal(storedValues.get('refreshToken'), 'refresh-token');
});

test('빈 값이나 잘못된 JSON 값은 로그인 토큰으로 취급하지 않는다', () => {
  for (const value of ['', 'null', 'undefined', '{}', '123', '""', '"null"', '"broken']) {
    storedValues.set('accessToken', value);
    assert.equal(auth.getAccessToken(), null, value);
    assert.equal(storedValues.has('accessToken'), false, value);
  }
});

test('호출부에서 이전 토큰을 먼저 읽어 헤더에 넣어도 따옴표 없이 전송한다', async () => {
  const legacyToken = JSON.stringify('Bearer legacy-token');
  storedValues.set('accessToken', legacyToken);

  await customAxios.get('/run', { headers: { Authorization: legacyToken } });

  assert.equal(sentAuthorization, 'Bearer legacy-token');
  assert.equal(storedValues.get('accessToken'), 'Bearer legacy-token');
});

test('인증 헤더를 직접 지정하지 않은 요청에도 호환된 토큰을 붙인다', async () => {
  storedValues.set('accessToken', JSON.stringify('Bearer legacy-token'));
  await customAxios.get('/calendar/monthly');
  assert.equal(sentAuthorization, 'Bearer legacy-token');
});

test('저장된 토큰이 없으면 인증 헤더를 만들지 않는다', async () => {
  await customAxios.get('/run');
  assert.equal(sentAuthorization, undefined);
});
