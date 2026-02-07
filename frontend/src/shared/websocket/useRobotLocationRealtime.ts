import { useCallback, useMemo, useRef, useState } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { parseRobotLocationRealtimePayload } from '@/shared/types';
import { useSubscription } from './useSubscription';
import { useWebSocket } from './useWebSocket';
import type {
    RobotLocationPayload,
    RobotLocationRealtimeState,
    WebSocketEnvelope,
} from './types';

const RECENT_MESSAGE_LIMIT = 200;

export type UseRobotLocationRealtimeOptions = {
    token?: string | null;
    robotId?: number | null;
    enabled?: boolean;
    reconnectDelayMs?: number;
    maxReconnectAttempts?: number;
    onLocation?: (state: RobotLocationRealtimeState) => void;
};

export type UseRobotLocationRealtimeResult = {
    status: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';
    isConnected: boolean;
    location: RobotLocationRealtimeState | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
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

const resolveMessageKey = (message: IMessage, fallback: object) => {
    const body = message.body?.trim();
    if (body && body.length > 0) {
        return `location:${body}`;
    }
    return `location:${JSON.stringify(fallback)}`;
};

export const useRobotLocationRealtime = ({
    token,
    robotId,
    enabled = true,
    reconnectDelayMs = 3000,
    maxReconnectAttempts = 10,
    onLocation,
}: UseRobotLocationRealtimeOptions): UseRobotLocationRealtimeResult => {
    const [location, setLocation] = useState<RobotLocationRealtimeState | null>(null);
    const receivedMessagesRef = useRef<Set<string>>(new Set());

    const shouldConnect = Boolean(enabled && token && robotId);

    const destination = useMemo(() => {
        if (!robotId) {
            return '';
        }

        return `/topic/robot/${robotId}/location`;
    }, [robotId]);

    const { client, isConnected, status } = useWebSocket({
        token,
        autoConnect: shouldConnect,
        reconnectDelayMs,
        maxReconnectAttempts,
    });

    const handleMessage = useCallback(
        (raw: RobotLocationPayload | WebSocketEnvelope<RobotLocationPayload>, message: IMessage) => {
            const messageKey = resolveMessageKey(
                message,
                isRecord(raw) ? raw : { payload: raw }
            );
            if (!rememberMessage(receivedMessagesRef.current, messageKey)) {
                return;
            }

            const envelope = isRecord(raw) && 'payload' in raw ? raw as WebSocketEnvelope<RobotLocationPayload> : null;
            if (envelope && envelope.type !== 'ROBOT_LOCATION_UPDATE') {
                return;
            }

            const candidate = envelope ? envelope.payload : raw;

            let parsed: RobotLocationRealtimeState;
            try {
                parsed = parseRobotLocationRealtimePayload(candidate);
            } catch {
                return;
            }

            if (robotId && parsed.robotId !== robotId) {
                return;
            }

            const nextState: RobotLocationRealtimeState =
                !parsed.timestamp && envelope?.timestamp
                    ? {
                        ...parsed,
                        timestamp: envelope.timestamp,
                    }
                    : parsed;

            setLocation(nextState);
            onLocation?.(nextState);
        },
        [onLocation, robotId]
    );

    useSubscription<RobotLocationPayload | WebSocketEnvelope<RobotLocationPayload>>({
        client,
        destination,
        enabled: Boolean(shouldConnect && destination),
        isConnected,
        onMessage: handleMessage,
    });

    return {
        status,
        isConnected,
        location,
    };
};
