import { useCallback, useMemo, useRef, useState } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { parseRobotLcdRealtimePayload } from '@/shared/types';
import { useSubscription } from './useSubscription';
import { useWebSocket } from './useWebSocket';
import type {
    LcdModePayload,
    RobotLcdRealtimeState,
    WebSocketEnvelope,
} from './types';

const RECENT_MESSAGE_LIMIT = 200;

export type UseRobotLcdRealtimeOptions = {
    token?: string | null;
    robotId?: number | null;
    enabled?: boolean;
    reconnectDelayMs?: number;
    maxReconnectAttempts?: number;
    onLcdChange?: (state: RobotLcdRealtimeState) => void;
};

export type UseRobotLcdRealtimeResult = {
    status: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';
    isConnected: boolean;
    lcdState: RobotLcdRealtimeState | null;
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
        return `lcd:${body}`;
    }
    return `lcd:${JSON.stringify(fallback)}`;
};

export const useRobotLcdRealtime = ({
    token,
    robotId,
    enabled = true,
    reconnectDelayMs = 3000,
    maxReconnectAttempts = 10,
    onLcdChange,
}: UseRobotLcdRealtimeOptions): UseRobotLcdRealtimeResult => {
    const [lcdState, setLcdState] = useState<RobotLcdRealtimeState | null>(null);
    const receivedMessagesRef = useRef<Set<string>>(new Set());

    const shouldConnect = Boolean(enabled && token && robotId);

    const destination = useMemo(() => {
        if (!robotId) {
            return '';
        }

        return `/topic/robot/${robotId}/lcd`;
    }, [robotId]);

    const { client, isConnected, status } = useWebSocket({
        token,
        autoConnect: shouldConnect,
        reconnectDelayMs,
        maxReconnectAttempts,
    });

    const handleMessage = useCallback(
        (raw: LcdModePayload | WebSocketEnvelope<LcdModePayload>, message: IMessage) => {
            const messageKey = resolveMessageKey(
                message,
                isRecord(raw) ? raw : { payload: raw }
            );
            if (!rememberMessage(receivedMessagesRef.current, messageKey)) {
                return;
            }

            const envelope = isRecord(raw) && 'payload' in raw ? raw as WebSocketEnvelope<LcdModePayload> : null;
            if (envelope && envelope.type !== 'LCD_MODE_CHANGE') {
                return;
            }

            const candidate = envelope ? envelope.payload : raw;
            let parsed: RobotLcdRealtimeState;
            try {
                parsed = parseRobotLcdRealtimePayload(candidate);
            } catch {
                return;
            }

            if (robotId && parsed.robotId !== robotId) {
                return;
            }

            const nextState: RobotLcdRealtimeState =
                !parsed.updatedAt && envelope?.timestamp
                    ? {
                        ...parsed,
                        updatedAt: envelope.timestamp,
                    }
                    : parsed;

            setLcdState(nextState);
            onLcdChange?.(nextState);
        },
        [onLcdChange, robotId]
    );

    useSubscription<LcdModePayload | WebSocketEnvelope<LcdModePayload>>({
        client,
        destination,
        enabled: Boolean(shouldConnect && destination),
        isConnected,
        onMessage: handleMessage,
    });

    return {
        status,
        isConnected,
        lcdState,
    };
};
