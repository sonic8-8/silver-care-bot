import { useCallback, useEffect, useRef, useState } from 'react';
import type { Client } from '@stomp/stompjs';
import { createStompClient, type StompClientOptions } from './stompClient';
import type { WebSocketStatus } from './types';

const DEFAULT_RECONNECT_DELAY_MS = 3000;
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 5;

export type UseWebSocketOptions = {
    url?: string;
    token?: string | null;
    autoConnect?: boolean;
    reconnectDelayMs?: number;
    maxReconnectAttempts?: number;
    onConnect?: (client: Client) => void;
    onDisconnect?: () => void;
};

export type UseWebSocketResult = {
    client: Client | null;
    status: WebSocketStatus;
    isConnected: boolean;
    connect: () => void;
    disconnect: () => Promise<void>;
};

export const useWebSocket = ({
    url,
    token,
    autoConnect = true,
    reconnectDelayMs = DEFAULT_RECONNECT_DELAY_MS,
    maxReconnectAttempts = DEFAULT_MAX_RECONNECT_ATTEMPTS,
    onConnect,
    onDisconnect,
}: UseWebSocketOptions = {}): UseWebSocketResult => {
    const [status, setStatus] = useState<WebSocketStatus>('DISCONNECTED');
    const clientRef = useRef<Client | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimerRef = useRef<number | null>(null);
    const manualDisconnectRef = useRef(false);
    const previousTokenRef = useRef<string | null | undefined>(token);
    const tokenVersionRef = useRef(0);
    const connectRef = useRef<() => void>(() => undefined);
    const disconnectRef = useRef<() => Promise<void>>(() => Promise.resolve());

    const clearReconnectTimer = useCallback(() => {
        if (reconnectTimerRef.current !== null) {
            window.clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
    }, []);

    const scheduleReconnect = useCallback(() => {
        if (manualDisconnectRef.current) {
            return;
        }
        if (reconnectTimerRef.current !== null) {
            return;
        }
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            setStatus('DISCONNECTED');
            return;
        }

        setStatus('CONNECTING');
        reconnectTimerRef.current = window.setTimeout(() => {
            reconnectTimerRef.current = null;
            reconnectAttemptsRef.current += 1;
            clientRef.current?.activate();
        }, reconnectDelayMs);
    }, [maxReconnectAttempts, reconnectDelayMs]);

    const initializeClient = useCallback(
        (nextToken?: string | null) => {
            const clientOptions: StompClientOptions = {
                url,
                token: nextToken,
                onConnect: (client) => {
                    reconnectAttemptsRef.current = 0;
                    setStatus('CONNECTED');
                    onConnect?.(client);
                },
                onDisconnect: () => {
                    onDisconnect?.();
                    if (!manualDisconnectRef.current) {
                        scheduleReconnect();
                    }
                },
                onWebSocketClose: () => {
                    if (!manualDisconnectRef.current) {
                        scheduleReconnect();
                    }
                },
                onStompError: () => {
                    if (!manualDisconnectRef.current) {
                        scheduleReconnect();
                    }
                },
            };

            clientRef.current = createStompClient(clientOptions);
            clientRef.current.activate();
        },
        [onConnect, onDisconnect, scheduleReconnect, url]
    );

    const connect = useCallback(() => {
        if (status === 'CONNECTED' || status === 'CONNECTING') {
            return;
        }

        manualDisconnectRef.current = false;
        clearReconnectTimer();
        setStatus('CONNECTING');
        initializeClient(token);
    }, [clearReconnectTimer, initializeClient, status, token]);

    const disconnect = useCallback(async () => {
        manualDisconnectRef.current = true;
        clearReconnectTimer();
        reconnectAttemptsRef.current = 0;
        setStatus('DISCONNECTED');

        if (clientRef.current) {
            await clientRef.current.deactivate();
        }
        clientRef.current = null;
    }, [clearReconnectTimer]);

    useEffect(() => {
        connectRef.current = connect;
    }, [connect]);

    useEffect(() => {
        disconnectRef.current = disconnect;
    }, [disconnect]);

    useEffect(() => {
        if (!autoConnect) {
            return;
        }
        connectRef.current();
        return () => {
            void disconnectRef.current();
        };
    }, [autoConnect]);

    useEffect(() => {
        if (previousTokenRef.current === token) {
            return;
        }
        previousTokenRef.current = token;
        const version = (tokenVersionRef.current += 1);

        clearReconnectTimer();
        reconnectAttemptsRef.current = 0;

        void (async () => {
            manualDisconnectRef.current = true;
            if (clientRef.current) {
                try {
                    await clientRef.current.deactivate();
                } catch {
                    // ignore cleanup errors
                }
                clientRef.current = null;
            }

            if (tokenVersionRef.current !== version) {
                return;
            }

            if (!token) {
                setStatus('DISCONNECTED');
                return;
            }

            manualDisconnectRef.current = false;
            setStatus('CONNECTING');
            initializeClient(token);
        })();
    }, [clearReconnectTimer, initializeClient, token]);

    return {
        client: clientRef.current,
        status,
        isConnected: status === 'CONNECTED',
        connect,
        disconnect,
    };
};
