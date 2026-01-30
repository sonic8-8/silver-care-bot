import { authHandlers } from './auth';
import { elderHandlers } from './elder';

export const handlers = [
    ...authHandlers,
    ...elderHandlers,
];
