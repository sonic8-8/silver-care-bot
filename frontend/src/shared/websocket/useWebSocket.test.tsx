import { renderHook, act } from '@testing-library/react';
import type { Client } from '@stomp/stompjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStompClient, type StompClientOptions } from './stompClient';
import { useWebSocket } from './useWebSocket';

vi.mock('./stompClient', () => ({
    createStompClient: vi.fn(),
}));

describe('useWebSocket', () => {
    const createStompClientMock = vi.mocked(createStompClient);
    let mockClient: Client;
    let capturedOptions: StompClientOptions | undefined;

    beforeEach(() => {
        vi.useFakeTimers();
        mockClient = {
            activate: vi.fn(),
            deactivate: vi.fn().mockResolvedValue(undefined),
        } as unknown as Client;
        createStompClientMock.mockImplementation((options) => {
            capturedOptions = options;
            return mockClient;
        });
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
        vi.clearAllMocks();
        capturedOptions = undefined;
    });

    it('connects and updates status on connect', () => {
        const { result } = renderHook(() => useWebSocket({ autoConnect: false }));

        act(() => {
            result.current.connect();
        });

        expect(result.current.status).toBe('CONNECTING');
        expect(mockClient.activate).toHaveBeenCalledTimes(1);

        act(() => {
            capturedOptions?.onConnect?.(mockClient);
        });

        expect(result.current.status).toBe('CONNECTED');
        expect(result.current.isConnected).toBe(true);
    });

    it('reconnects up to max attempts', () => {
        const { result } = renderHook(() =>
            useWebSocket({
                autoConnect: false,
                reconnectDelayMs: 3000,
                maxReconnectAttempts: 2,
            })
        );

        act(() => {
            result.current.connect();
        });

        act(() => {
            capturedOptions?.onWebSocketClose?.();
        });

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        act(() => {
            capturedOptions?.onWebSocketClose?.();
        });

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        act(() => {
            capturedOptions?.onWebSocketClose?.();
        });

        expect(mockClient.activate).toHaveBeenCalledTimes(3);
        expect(result.current.status).toBe('DISCONNECTED');
    });

    it('disconnect stops reconnection attempts', async () => {
        const { result } = renderHook(() => useWebSocket({ autoConnect: false }));

        act(() => {
            result.current.connect();
        });

        await act(async () => {
            await result.current.disconnect();
        });

        act(() => {
            capturedOptions?.onWebSocketClose?.();
        });

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(mockClient.activate).toHaveBeenCalledTimes(1);
        expect(result.current.status).toBe('DISCONNECTED');
    });

    it('reconnects when token changes while disconnected', () => {
        const { rerender } = renderHook(
            ({ token }) => useWebSocket({ autoConnect: false, token }),
            { initialProps: { token: null as string | null } }
        );

        act(() => {
            rerender({ token: 'new-token' });
        });

        expect(createStompClientMock).toHaveBeenCalledTimes(1);
        expect(mockClient.activate).toHaveBeenCalledTimes(1);
    });
});
