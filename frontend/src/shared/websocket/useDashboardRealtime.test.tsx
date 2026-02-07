import { act, renderHook } from '@testing-library/react';
import type { IMessage } from '@stomp/stompjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WebSocketEnvelope } from './types';
import { useDashboardRealtime } from './useDashboardRealtime';

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

describe('useDashboardRealtime', () => {
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

    it('subscribes to robot and elder topics with given ids', () => {
        renderHook(() =>
            useDashboardRealtime({
                token: 'access-token',
                robotId: 10,
                elderId: 22,
            })
        );

        expect(subscriptions).toHaveLength(2);
        expect(subscriptions[0]?.destination).toBe('/topic/robot/10/status');
        expect(subscriptions[1]?.destination).toBe('/topic/elder/22/status');
        expect(subscriptions[0]?.enabled).toBe(true);
        expect(subscriptions[1]?.enabled).toBe(true);
    });

    it('deduplicates duplicated robot status message', () => {
        const onRobotStatus = vi.fn();
        const { result } = renderHook(() =>
            useDashboardRealtime({
                token: 'access-token',
                robotId: 10,
                onRobotStatus,
            })
        );

        const robotSubscription = subscriptions.find((entry) => entry.destination.includes('/topic/robot/'));
        expect(robotSubscription).toBeDefined();

        const envelope: WebSocketEnvelope<{
            robotId: number;
            elderId: number;
            batteryLevel: number;
            networkStatus: string;
            currentLocation: string;
            lcdMode: string;
        }> = {
            type: 'ROBOT_STATUS_UPDATE',
            payload: {
                robotId: 10,
                elderId: 22,
                batteryLevel: 80,
                networkStatus: 'CONNECTED',
                currentLocation: '거실',
                lcdMode: 'IDLE',
            },
            timestamp: '2026-02-07T10:00:00+09:00',
        };

        const message = createMessage(JSON.stringify(envelope));

        act(() => {
            robotSubscription?.onMessage(envelope, message);
            robotSubscription?.onMessage(envelope, message);
        });

        expect(onRobotStatus).toHaveBeenCalledTimes(1);
        expect(result.current.robotStatus?.networkStatus).toBe('CONNECTED');
        expect(result.current.robotStatus?.lcdMode).toBe('IDLE');
    });

    it('ignores status when topic id and payload id mismatch', () => {
        const onRobotStatus = vi.fn();
        const { result } = renderHook(() =>
            useDashboardRealtime({
                token: 'access-token',
                robotId: 10,
                onRobotStatus,
            })
        );

        const robotSubscription = subscriptions.find((entry) => entry.destination.includes('/topic/robot/'));
        expect(robotSubscription).toBeDefined();

        const envelope: WebSocketEnvelope<{ robotId: number; networkStatus: string }> = {
            type: 'ROBOT_STATUS_UPDATE',
            payload: {
                robotId: 11,
                networkStatus: 'CONNECTED',
            },
            timestamp: '2026-02-07T10:00:00+09:00',
        };

        act(() => {
            robotSubscription?.onMessage(envelope, createMessage(JSON.stringify(envelope)));
        });

        expect(onRobotStatus).not.toHaveBeenCalled();
        expect(result.current.robotStatus).toBeNull();
    });

    it('applies elder status update and calls callback', () => {
        const onElderStatus = vi.fn();
        const { result } = renderHook(() =>
            useDashboardRealtime({
                token: 'access-token',
                elderId: 22,
                onElderStatus,
            })
        );

        const elderSubscription = subscriptions.find((entry) => entry.destination.includes('/topic/elder/'));
        expect(elderSubscription).toBeDefined();

        const envelope: WebSocketEnvelope<{
            elderId: number;
            status: string;
            lastActivity: string;
            location: string;
        }> = {
            type: 'ELDER_STATUS_UPDATE',
            payload: {
                elderId: 22,
                status: 'SAFE',
                lastActivity: '약 복용',
                location: '거실',
            },
            timestamp: '2026-02-07T10:01:00+09:00',
        };

        act(() => {
            elderSubscription?.onMessage(envelope, createMessage(JSON.stringify(envelope)));
        });

        expect(onElderStatus).toHaveBeenCalledTimes(1);
        expect(result.current.elderStatus?.elderId).toBe(22);
        expect(result.current.elderStatus?.status).toBe('SAFE');
        expect(result.current.elderStatus?.lastActivity).toBe('약 복용');
        expect(result.current.elderStatus?.location).toBe('거실');
    });

    it('ignores elder status when topic id and payload id mismatch', () => {
        const onElderStatus = vi.fn();
        const { result } = renderHook(() =>
            useDashboardRealtime({
                token: 'access-token',
                elderId: 22,
                onElderStatus,
            })
        );

        const elderSubscription = subscriptions.find((entry) => entry.destination.includes('/topic/elder/'));
        expect(elderSubscription).toBeDefined();

        const envelope: WebSocketEnvelope<{ elderId: number; status: string }> = {
            type: 'ELDER_STATUS_UPDATE',
            payload: {
                elderId: 23,
                status: 'SAFE',
            },
            timestamp: '2026-02-07T10:01:00+09:00',
        };

        act(() => {
            elderSubscription?.onMessage(envelope, createMessage(JSON.stringify(envelope)));
        });

        expect(onElderStatus).not.toHaveBeenCalled();
        expect(result.current.elderStatus).toBeNull();
    });
});
