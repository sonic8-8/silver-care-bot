import { authHandlers } from './auth';
import { elderHandlers } from './elder';
import { emergencyHandlers } from './emergency';
import { historyHandlers } from './history';
import { mapVideoHandlers } from './mapVideo';
import { notificationHandlers } from './notification';
import { robotHandlers } from './robot';

export const handlers = [
    ...authHandlers,
    ...elderHandlers,
    ...robotHandlers,
    ...mapVideoHandlers,
    ...emergencyHandlers,
    ...notificationHandlers,
    ...historyHandlers,
];
