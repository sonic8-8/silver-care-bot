import { act, renderHook } from '@testing-library/react';
import type { IMessage } from '@stomp/stompjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WebSocketEnvelope } from './types';
import { useRobotLocationRealtime } from './useRobotLocationRealtime';

const {
    useWebSocketMock,
    useSubscriptionMock,
} = vi.hoisted(() => ({
    useWebSocketMock: vi.fn(),
    useSubscriptionMock: vi.fn(),
}));

vi.mock('./useWebSocket', () => ({
    useWebSocket: useWebSocketMock,
}));

vi.mock('./useSubscription', () => ({
    useSubscription: useSubscriptionMock,
}));

type SubscriptionOption = {
    destination: string;
    enabled?: boolean;
    onMessage: (payload: unknown, message: IMessage) => void;
};

const createMessage = (body: string) =>
    ({
        body,
    } as IMessage);

describe('useRobotLocationRealtime', () => {
    let subscriptions: SubscriptionOption[];

    beforeEach(() => {
        subscriptions = [];
        useSubscriptionMock.mockReset();
        useWebSocketMock.mockReset();

        useWebSocketMock.mockReturnValue({
            client: {} as never,
            status: 'CONNECTED',
            isConnected: true,
            connect: vi.fn(),
            disconnect: vi.fn(),
        });

        useSubscriptionMock.mockImplementation((options: SubscriptionOption) => {
            subscriptions.push(options);
        });
    });

    it('subscribes to robot location topic', () => {
        renderHook(() =>
            useRobotLocationRealtime({
                token: 'access-token',
                robotId: 10,
            })
        );

        expect(subscriptions).toHaveLength(1);
        expect(subscriptions[0]?.destination).toBe('/topic/robot/10/location');
        expect(subscriptions[0]?.enabled).toBe(true);
    });

    it('applies location update envelope', () => {
        const onLocation = vi.fn();
        const { result } = renderHook(() =>
            useRobotLocationRealtime({
                token: 'access-token',
                robotId: 10,
                onLocation,
            })
        );

        const locationSubscription = subscriptions[0];
        expect(locationSubscription).toBeDefined();

        const envelope: WebSocketEnvelope<{
            robotId: number;
            elderId: number;
            roomId: string;
            x: number;
            y: number;
            heading: number;
        }> = {
            type: 'ROBOT_LOCATION_UPDATE',
            payload: {
                robotId: 10,
                elderId: 22,
                roomId: 'LIVING_ROOM',
                x: 450,
                y: 150,
                heading: 45,
            },
            timestamp: '2026-02-07T10:23:00+09:00',
        };

        act(() => {
            locationSubscription?.onMessage(envelope, createMessage(JSON.stringify(envelope)));
        });

        expect(onLocation).toHaveBeenCalledTimes(1);
        expect(result.current.location).toMatchObject({
            robotId: 10,
            elderId: 22,
            roomId: 'LIVING_ROOM',
            x: 450,
            y: 150,
            heading: 45,
            timestamp: '2026-02-07T10:23:00+09:00',
        });
    });

    it('deduplicates duplicated messages', () => {
        const onLocation = vi.fn();
        renderHook(() =>
            useRobotLocationRealtime({
                token: 'access-token',
                robotId: 10,
                onLocation,
            })
        );

        const locationSubscription = subscriptions[0];
        expect(locationSubscription).toBeDefined();

        const envelope: WebSocketEnvelope<{
            robotId: number;
            roomId: string;
            x: number;
            y: number;
            heading: number;
        }> = {
            type: 'ROBOT_LOCATION_UPDATE',
            payload: {
                robotId: 10,
                roomId: 'KITCHEN',
                x: 120,
                y: 220,
                heading: 180,
            },
            timestamp: '2026-02-07T10:25:00+09:00',
        };

        const message = createMessage(JSON.stringify(envelope));

        act(() => {
            locationSubscription?.onMessage(envelope, message);
            locationSubscription?.onMessage(envelope, message);
        });

        expect(onLocation).toHaveBeenCalledTimes(1);
    });

    it('accepts raw payload without STOMP envelope for embedded bridge compatibility', () => {
        const onLocation = vi.fn();
        const { result } = renderHook(() =>
            useRobotLocationRealtime({
                token: 'access-token',
                robotId: 10,
                onLocation,
            })
        );

        const locationSubscription = subscriptions[0];
        expect(locationSubscription).toBeDefined();

        const payload = {
            robotId: 10,
            elderId: 22,
            roomId: 'KITCHEN',
            x: 120,
            y: 220,
            heading: 180,
            timestamp: '2026-02-07T10:26:00+09:00',
        };

        act(() => {
            locationSubscription?.onMessage(payload, createMessage(JSON.stringify(payload)));
        });

        expect(onLocation).toHaveBeenCalledTimes(1);
        expect(result.current.location?.robotId).toBe(10);
        expect(result.current.location?.timestamp).toBe('2026-02-07T10:26:00+09:00');
    });

    it('ignores mismatched robot id and wrong message type', () => {
        const onLocation = vi.fn();
        const { result } = renderHook(() =>
            useRobotLocationRealtime({
                token: 'access-token',
                robotId: 10,
                onLocation,
            })
        );

        const locationSubscription = subscriptions[0];
        expect(locationSubscription).toBeDefined();

        const wrongTypeEnvelope: WebSocketEnvelope<{
            robotId: number;
            roomId: string;
            x: number;
            y: number;
            heading: number;
        }> = {
            type: 'ROBOT_STATUS_UPDATE',
            payload: {
                robotId: 10,
                roomId: 'KITCHEN',
                x: 120,
                y: 220,
                heading: 180,
            },
        };

        const mismatchedRobotEnvelope: WebSocketEnvelope<{
            robotId: number;
            roomId: string;
            x: number;
            y: number;
            heading: number;
        }> = {
            type: 'ROBOT_LOCATION_UPDATE',
            payload: {
                robotId: 11,
                roomId: 'KITCHEN',
                x: 120,
                y: 220,
                heading: 180,
            },
        };

        act(() => {
            locationSubscription?.onMessage(
                wrongTypeEnvelope,
                createMessage(JSON.stringify(wrongTypeEnvelope))
            );
            locationSubscription?.onMessage(
                mismatchedRobotEnvelope,
                createMessage(JSON.stringify(mismatchedRobotEnvelope))
            );
        });

        expect(onLocation).not.toHaveBeenCalled();
        expect(result.current.location).toBeNull();
    });
});
