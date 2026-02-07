import { authHandlers } from './auth';
import { elderHandlers } from './elder';
import { emergencyHandlers } from './emergency';
import { historyHandlers } from './history';
import { notificationHandlers } from './notification';
import { robotHandlers } from './robot';

export const handlers = [
    ...authHandlers,
    ...elderHandlers,
    ...robotHandlers,
    ...emergencyHandlers,
    ...notificationHandlers,
    ...historyHandlers,
];
