import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from '../mocks/server';

// 각 테스트 후 자동으로 cleanup 실행
beforeAll(() => server.listen());

afterEach(() => {
    server.resetHandlers();
    cleanup();
});

afterAll(() => server.close());
