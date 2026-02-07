import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { useSubscription } from '@/shared/websocket/useSubscription';
import { useWebSocket } from '@/shared/websocket/useWebSocket';
import type {
    ElderStatusPayload,
    RobotStatusPayload,
    WebSocketEnvelope,
} from '@/shared/websocket/types';
import type { RobotConnectionStatus, RobotLcdMode } from '@/shared/types/robot.types';

const RECENT_MESSAGE_LIMIT = 200;

export type DashboardRobotRealtimeState = {
    robotId: number;
    elderId: number | null;
    batteryLevel: number | null;
    networkStatus: RobotConnectionStatus | null;
    currentLocation: string | null;
    lcdMode: RobotLcdMode | null;
    timestamp?: string;
};

export type DashboardElderRealtimeState = {
    elderId: number;
    status: string;
    lastActivity: string | null;
    location: string | null;
    timestamp?: string;
};

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
    if (value === 'CONNECTED' || value === 'DISCONNECTED') {
        return value;
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

    useEffect(() => {
        // 대상 어르신/로봇 전환 즉시 stale 상태 제거
        setRobotStatus(null);
        setElderStatus(null);
        receivedMessagesRef.current.clear();
    }, [elderId, robotId]);

    const handleRobotStatus = useCallback(
        (envelope: WebSocketEnvelope<RobotStatusPayload>, message: IMessage) => {
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
            if (elderId && typeof payload.elderId === 'number' && payload.elderId !== elderId) {
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
        },
        [elderId, onRobotStatus, robotId]
    );

    const handleElderStatus = useCallback(
        (envelope: WebSocketEnvelope<ElderStatusPayload>, message: IMessage) => {
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
        },
        [elderId, onElderStatus]
    );

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

    const guardedRobotStatus = useMemo(() => {
        if (!robotStatus) {
            return null;
        }
        if (robotId && robotStatus.robotId !== robotId) {
            return null;
        }
        if (elderId && robotStatus.elderId && robotStatus.elderId !== elderId) {
            return null;
        }

        return robotStatus;
    }, [elderId, robotId, robotStatus]);

    const guardedElderStatus = useMemo(() => {
        if (!elderStatus) {
            return null;
        }
        if (elderId && elderStatus.elderId !== elderId) {
            return null;
        }

        return elderStatus;
    }, [elderId, elderStatus]);

    return {
        status,
        isConnected,
        robotStatus: guardedRobotStatus,
        elderStatus: guardedElderStatus,
    };
};
