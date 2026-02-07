import { useCallback, useMemo, useRef, useState } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { useSubscription } from './useSubscription';
import { useWebSocket } from './useWebSocket';
import type {
    DashboardElderRealtimeState,
    DashboardRobotRealtimeState,
    ElderStatusPayload,
    RobotStatusPayload,
    WebSocketEnvelope,
} from './types';
import type { RobotConnectionStatus, RobotLcdMode } from '@/shared/types/robot.types';

const RECENT_MESSAGE_LIMIT = 200;

export type UseDashboardRealtimeOptions = {
    token?: string | null;
    robotId?: number | null;
    elderId?: number | null;
    enabled?: boolean;
    reconnectDelayMs?: number;
    maxReconnectAttempts?: number;
    onRobotStatus?: (state: DashboardRobotRealtimeState) => void;
    onElderStatus?: (state: DashboardElderRealtimeState) => void;
};

export type UseDashboardRealtimeResult = {
    status: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';
    isConnected: boolean;
    robotStatus: DashboardRobotRealtimeState | null;
    elderStatus: DashboardElderRealtimeState | null;
};

const parseConnectionStatus = (value: unknown): RobotConnectionStatus | null => {
    if (value === 'CONNECTED') {
        return 'CONNECTED';
    }
    if (value === 'DISCONNECTED') {
        return 'DISCONNECTED';
    }
    return null;
};

const parseLcdMode = (value: unknown): RobotLcdMode | null => {
    if (
        value === 'IDLE'
        || value === 'GREETING'
        || value === 'MEDICATION'
        || value === 'SCHEDULE'
        || value === 'LISTENING'
        || value === 'EMERGENCY'
        || value === 'SLEEP'
    ) {
        return value;
    }
    return null;
};

const rememberMessage = (store: Set<string>, key: string) => {
    if (store.has(key)) {
        return false;
    }

    store.add(key);

    if (store.size > RECENT_MESSAGE_LIMIT) {
        const first = store.values().next().value;
        if (first) {
            store.delete(first);
        }
    }

    return true;
};

const resolveMessageKey = (prefix: 'robot' | 'elder', message: IMessage, fallback: object) => {
    const body = message.body?.trim();
    if (body && body.length > 0) {
        return `${prefix}:${body}`;
    }
    return `${prefix}:${JSON.stringify(fallback)}`;
};

export const useDashboardRealtime = ({
    token,
    robotId,
    elderId,
    enabled = true,
    reconnectDelayMs = 3000,
    maxReconnectAttempts = 10,
    onRobotStatus,
    onElderStatus,
}: UseDashboardRealtimeOptions): UseDashboardRealtimeResult => {
    const [robotStatus, setRobotStatus] = useState<DashboardRobotRealtimeState | null>(null);
    const [elderStatus, setElderStatus] = useState<DashboardElderRealtimeState | null>(null);
    const receivedMessagesRef = useRef<Set<string>>(new Set());

    const shouldConnect = Boolean(enabled && token && (robotId || elderId));

    const robotDestination = useMemo(() => {
        if (!robotId) {
            return '';
        }
        return `/topic/robot/${robotId}/status`;
    }, [robotId]);

    const elderDestination = useMemo(() => {
        if (!elderId) {
            return '';
        }
        return `/topic/elder/${elderId}/status`;
    }, [elderId]);

    const { client, isConnected, status } = useWebSocket({
        token,
        autoConnect: shouldConnect,
        reconnectDelayMs,
        maxReconnectAttempts,
    });

    const handleRobotStatus = useCallback((
        envelope: WebSocketEnvelope<RobotStatusPayload>,
        message: IMessage
    ) => {
        const messageKey = resolveMessageKey('robot', message, envelope);
        if (!rememberMessage(receivedMessagesRef.current, messageKey)) {
            return;
        }

        if (envelope.type !== 'ROBOT_STATUS_UPDATE') {
            return;
        }

        const payload = envelope.payload;
        if (!payload || typeof payload.robotId !== 'number') {
            return;
        }
        if (robotId && payload.robotId !== robotId) {
            return;
        }

        const nextState: DashboardRobotRealtimeState = {
            robotId: payload.robotId,
            elderId: payload.elderId ?? null,
            batteryLevel: payload.batteryLevel ?? null,
            networkStatus: parseConnectionStatus(payload.networkStatus),
            currentLocation: payload.currentLocation ?? null,
            lcdMode: parseLcdMode(payload.lcdMode),
            timestamp: envelope.timestamp,
        };

        setRobotStatus(nextState);
        onRobotStatus?.(nextState);
    }, [onRobotStatus, robotId]);

    const handleElderStatus = useCallback((
        envelope: WebSocketEnvelope<ElderStatusPayload>,
        message: IMessage
    ) => {
        const messageKey = resolveMessageKey('elder', message, envelope);
        if (!rememberMessage(receivedMessagesRef.current, messageKey)) {
            return;
        }

        if (envelope.type !== 'ELDER_STATUS_UPDATE') {
            return;
        }

        const payload = envelope.payload;
        if (!payload || typeof payload.elderId !== 'number') {
            return;
        }
        if (elderId && payload.elderId !== elderId) {
            return;
        }

        const nextState: DashboardElderRealtimeState = {
            elderId: payload.elderId,
            status: payload.status,
            lastActivity: payload.lastActivity ?? null,
            location: payload.location ?? null,
            timestamp: envelope.timestamp,
        };

        setElderStatus(nextState);
        onElderStatus?.(nextState);
    }, [elderId, onElderStatus]);

    useSubscription<WebSocketEnvelope<RobotStatusPayload>>({
        client,
        destination: robotDestination,
        enabled: Boolean(shouldConnect && robotDestination),
        isConnected,
        onMessage: handleRobotStatus,
    });

    useSubscription<WebSocketEnvelope<ElderStatusPayload>>({
        client,
        destination: elderDestination,
        enabled: Boolean(shouldConnect && elderDestination),
        isConnected,
        onMessage: handleElderStatus,
    });

    return {
        status,
        isConnected,
        robotStatus,
        elderStatus,
    };
};
