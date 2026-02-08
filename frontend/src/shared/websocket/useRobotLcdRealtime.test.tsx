import { act, renderHook } from '@testing-library/react';
import type { IMessage } from '@stomp/stompjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WebSocketEnvelope } from './types';
import { useRobotLcdRealtime } from './useRobotLcdRealtime';

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

describe('useRobotLcdRealtime', () => {
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

    it('subscribes to robot lcd topic', () => {
        renderHook(() =>
            useRobotLcdRealtime({
                token: 'access-token',
                robotId: 10,
            })
        );

        expect(subscriptions).toHaveLength(1);
        expect(subscriptions[0]?.destination).toBe('/topic/robot/10/lcd');
        expect(subscriptions[0]?.enabled).toBe(true);
    });

    it('applies lcd mode change envelope', () => {
        const onLcdChange = vi.fn();
        const { result } = renderHook(() =>
            useRobotLcdRealtime({
                token: 'access-token',
                robotId: 10,
                onLcdChange,
            })
        );

        const lcdSubscription = subscriptions[0];
        expect(lcdSubscription).toBeDefined();

        const envelope: WebSocketEnvelope<{
            robotId: number;
            mode: string;
            emotion: string;
            message: string;
            subMessage: string;
            updatedAt: string;
        }> = {
            type: 'LCD_MODE_CHANGE',
            payload: {
                robotId: 10,
                mode: 'MEDICATION',
                emotion: 'happy',
                message: '약 드실 시간이에요!',
                subMessage: '아침약 2정',
                updatedAt: '2026-02-08T08:30:00+09:00',
            },
            timestamp: '2026-02-08T08:30:01+09:00',
        };

        act(() => {
            lcdSubscription?.onMessage(envelope, createMessage(JSON.stringify(envelope)));
        });

        expect(onLcdChange).toHaveBeenCalledTimes(1);
        expect(result.current.lcdState).toMatchObject({
            robotId: 10,
            mode: 'MEDICATION',
            emotion: 'happy',
            message: '약 드실 시간이에요!',
            subMessage: '아침약 2정',
            updatedAt: '2026-02-08T08:30:00+09:00',
        });
    });

    it('fills updatedAt from envelope timestamp when payload does not include it', () => {
        const { result } = renderHook(() =>
            useRobotLcdRealtime({
                token: 'access-token',
                robotId: 10,
            })
        );

        const lcdSubscription = subscriptions[0];
        expect(lcdSubscription).toBeDefined();

        const envelope: WebSocketEnvelope<{
            robotId: number;
            mode: string;
            emotion: string;
            message: string;
            subMessage: string;
        }> = {
            type: 'LCD_MODE_CHANGE',
            payload: {
                robotId: 10,
                mode: 'LISTENING',
                emotion: 'neutral',
                message: '듣고 있어요.',
                subMessage: '말씀해 주세요.',
            },
            timestamp: '2026-02-08T08:31:00+09:00',
        };

        act(() => {
            lcdSubscription?.onMessage(envelope, createMessage(JSON.stringify(envelope)));
        });

        expect(result.current.lcdState?.updatedAt).toBe('2026-02-08T08:31:00+09:00');
    });

    it('accepts raw payload without STOMP envelope for embedded bridge compatibility', () => {
        const onLcdChange = vi.fn();
        const { result } = renderHook(() =>
            useRobotLcdRealtime({
                token: 'access-token',
                robotId: 10,
                onLcdChange,
            })
        );

        const lcdSubscription = subscriptions[0];
        expect(lcdSubscription).toBeDefined();

        const payload = {
            robotId: 10,
            mode: 'SCHEDULE',
            emotion: 'neutral',
            message: '일정 시간이 다가오고 있어요.',
            subMessage: '12:00 병원 방문',
            updatedAt: '2026-02-08T08:31:30+09:00',
        };

        act(() => {
            lcdSubscription?.onMessage(payload, createMessage(JSON.stringify(payload)));
        });

        expect(onLcdChange).toHaveBeenCalledTimes(1);
        expect(result.current.lcdState?.mode).toBe('SCHEDULE');
        expect(result.current.lcdState?.updatedAt).toBe('2026-02-08T08:31:30+09:00');
    });

    it('deduplicates duplicated messages', () => {
        const onLcdChange = vi.fn();
        renderHook(() =>
            useRobotLcdRealtime({
                token: 'access-token',
                robotId: 10,
                onLcdChange,
            })
        );

        const lcdSubscription = subscriptions[0];
        expect(lcdSubscription).toBeDefined();

        const envelope: WebSocketEnvelope<{
            robotId: number;
            mode: string;
            emotion: string;
            message: string;
            subMessage: string;
            updatedAt: string;
        }> = {
            type: 'LCD_MODE_CHANGE',
            payload: {
                robotId: 10,
                mode: 'IDLE',
                emotion: 'neutral',
                message: '',
                subMessage: '',
                updatedAt: '2026-02-08T08:32:00+09:00',
            },
        };

        const message = createMessage(JSON.stringify(envelope));

        act(() => {
            lcdSubscription?.onMessage(envelope, message);
            lcdSubscription?.onMessage(envelope, message);
        });

        expect(onLcdChange).toHaveBeenCalledTimes(1);
    });

    it('ignores mismatched robot id and wrong message type', () => {
        const onLcdChange = vi.fn();
        const { result } = renderHook(() =>
            useRobotLcdRealtime({
                token: 'access-token',
                robotId: 10,
                onLcdChange,
            })
        );

        const lcdSubscription = subscriptions[0];
        expect(lcdSubscription).toBeDefined();

        const wrongTypeEnvelope: WebSocketEnvelope<{
            robotId: number;
            mode: string;
            emotion: string;
            message: string;
            subMessage: string;
        }> = {
            type: 'ROBOT_STATUS_UPDATE',
            payload: {
                robotId: 10,
                mode: 'IDLE',
                emotion: 'neutral',
                message: '',
                subMessage: '',
            },
        };

        const mismatchedRobotEnvelope: WebSocketEnvelope<{
            robotId: number;
            mode: string;
            emotion: string;
            message: string;
            subMessage: string;
        }> = {
            type: 'LCD_MODE_CHANGE',
            payload: {
                robotId: 11,
                mode: 'IDLE',
                emotion: 'neutral',
                message: '',
                subMessage: '',
            },
        };

        act(() => {
            lcdSubscription?.onMessage(
                wrongTypeEnvelope,
                createMessage(JSON.stringify(wrongTypeEnvelope))
            );
            lcdSubscription?.onMessage(
                mismatchedRobotEnvelope,
                createMessage(JSON.stringify(mismatchedRobotEnvelope))
            );
        });

        expect(onLcdChange).not.toHaveBeenCalled();
        expect(result.current.lcdState).toBeNull();
    });
});
