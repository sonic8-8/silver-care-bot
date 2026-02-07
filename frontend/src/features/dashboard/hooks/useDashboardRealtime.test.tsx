import { act, renderHook } from '@testing-library/react';
import type { IMessage } from '@stomp/stompjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WebSocketEnvelope } from '@/shared/websocket/types';
import { useDashboardRealtime } from './useDashboardRealtime';

const {
    useWebSocketMock,
    useSubscriptionMock,
} = vi.hoisted(() => ({
    useWebSocketMock: vi.fn(),
    useSubscriptionMock: vi.fn(),
}));

vi.mock('@/shared/websocket/useWebSocket', () => ({
    useWebSocket: useWebSocketMock,
}));

vi.mock('@/shared/websocket/useSubscription', () => ({
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

    it('resets stale realtime state when elder id changes', () => {
        const { result, rerender } = renderHook(
            ({ elderId }: { elderId: number }) =>
                useDashboardRealtime({
                    token: 'access-token',
                    robotId: 10,
                    elderId,
                }),
            {
                initialProps: {
                    elderId: 1,
                },
            }
        );

        const elderSubscription = subscriptions.find((entry) => entry.destination === '/topic/elder/1/status');
        expect(elderSubscription).toBeDefined();

        const envelope: WebSocketEnvelope<{ elderId: number; status: string }> = {
            type: 'ELDER_STATUS_UPDATE',
            payload: {
                elderId: 1,
                status: 'SAFE',
            },
        };

        act(() => {
            elderSubscription?.onMessage(envelope, createMessage(JSON.stringify(envelope)));
        });

        expect(result.current.elderStatus?.elderId).toBe(1);

        rerender({
            elderId: 2,
        });

        expect(result.current.elderStatus).toBeNull();
    });

    it('ignores robot status when current elder id mismatches', () => {
        const { result } = renderHook(() =>
            useDashboardRealtime({
                token: 'access-token',
                robotId: 10,
                elderId: 22,
            })
        );

        const robotSubscription = subscriptions.find((entry) => entry.destination.includes('/topic/robot/'));
        expect(robotSubscription).toBeDefined();

        const mismatchedElderEnvelope: WebSocketEnvelope<{
            robotId: number;
            elderId: number;
            networkStatus: string;
        }> = {
            type: 'ROBOT_STATUS_UPDATE',
            payload: {
                robotId: 10,
                elderId: 99,
                networkStatus: 'CONNECTED',
            },
        };

        act(() => {
            robotSubscription?.onMessage(
                mismatchedElderEnvelope,
                createMessage(JSON.stringify(mismatchedElderEnvelope))
            );
        });

        expect(result.current.robotStatus).toBeNull();
    });
});
