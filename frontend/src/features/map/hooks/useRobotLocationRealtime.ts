import { useCallback, useMemo, useState } from 'react';
import { useSubscription } from '@/shared/websocket/useSubscription';
import { useWebSocket } from '@/shared/websocket/useWebSocket';
import type { RobotLocationRealtimePayload } from '../types';

type RobotLocationEnvelope = {
    type?: string;
    payload?: unknown;
    timestamp?: string;
};

type UseRobotLocationRealtimeOptions = {
    token?: string | null;
    robotId?: number | null;
    elderId?: number | null;
    enabled?: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
};

const toNullableFiniteNumber = (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    return null;
};

const toNullableString = (value: unknown) => {
    return typeof value === 'string' ? value : null;
};

const parseLocationPayload = (
    raw: unknown,
    fallbackTimestamp: string | undefined
): RobotLocationRealtimePayload | null => {
    if (!isRecord(raw) || typeof raw.robotId !== 'number') {
        return null;
    }

    const x = toNullableFiniteNumber(raw.x);
    const y = toNullableFiniteNumber(raw.y);
    if (x === null || y === null) {
        return null;
    }

    const heading = toNullableFiniteNumber(raw.heading);

    return {
        robotId: raw.robotId,
        elderId: typeof raw.elderId === 'number' ? raw.elderId : null,
        x,
        y,
        roomId: toNullableString(raw.roomId),
        heading,
        timestamp: toNullableString(raw.timestamp) ?? fallbackTimestamp ?? null,
    };
};

export const useRobotLocationRealtime = ({
    token,
    robotId,
    elderId,
    enabled = true,
}: UseRobotLocationRealtimeOptions) => {
    const [position, setPosition] = useState<RobotLocationRealtimePayload | null>(null);
    const shouldConnect = Boolean(enabled && token && robotId);

    const destination = useMemo(() => {
        if (!robotId) {
            return '';
        }
        return `/topic/robot/${robotId}/location`;
    }, [robotId]);

    const { client, status, isConnected } = useWebSocket({
        token,
        autoConnect: shouldConnect,
    });

    const handleMessage = useCallback((incoming: RobotLocationEnvelope) => {
        const envelope = isRecord(incoming) ? incoming : {};
        const payloadCandidate = isRecord(envelope.payload) ? envelope.payload : incoming;
        const parsed = parseLocationPayload(payloadCandidate, toNullableString(envelope.timestamp) ?? undefined);

        if (!parsed) {
            return;
        }
        if (robotId && parsed.robotId !== robotId) {
            return;
        }
        if (elderId && parsed.elderId && parsed.elderId !== elderId) {
            return;
        }

        setPosition(parsed);
    }, [elderId, robotId]);

    useSubscription<RobotLocationEnvelope>({
        client,
        destination,
        enabled: Boolean(shouldConnect && destination),
        isConnected,
        onMessage: handleMessage,
    });

    return {
        status,
        isConnected,
        position,
    };
};
