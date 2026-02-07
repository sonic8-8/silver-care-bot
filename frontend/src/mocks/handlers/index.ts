import { authHandlers } from './auth';
import { elderHandlers } from './elder';
import { emergencyHandlers } from './emergency';
import { historyHandlers } from './history';
import { mapHandlers } from './map';
import { notificationHandlers } from './notification';
import { robotHandlers } from './robot';

export const handlers = [
    ...authHandlers,
    ...elderHandlers,
    ...robotHandlers,
    ...mapHandlers,
    ...emergencyHandlers,
    ...notificationHandlers,
    ...historyHandlers,
];
