import { Client, type IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type StompClientOptions = {
    url?: string;
    token?: string | null;
    onConnect?: (client: Client) => void;
    onDisconnect?: () => void;
    onStompError?: (frame: IFrame) => void;
    onWebSocketClose?: () => void;
};

const defaultWebSocketUrl = import.meta.env.VITE_WS_BASE_URL || '/ws';

const buildAuthorizationHeader = (token?: string | null) => {
    if (!token) {
        return undefined;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export const createStompClient = ({
    url = defaultWebSocketUrl,
    token,
    onConnect,
    onDisconnect,
    onStompError,
    onWebSocketClose,
}: StompClientOptions) => {
    const authorization = buildAuthorizationHeader(token);
    const client = new Client({
        webSocketFactory: () => new SockJS(url),
        connectHeaders: authorization ? { Authorization: authorization } : {},
        reconnectDelay: 0,
        debug: () => undefined,
        onConnect: () => onConnect?.(client),
        onDisconnect: () => onDisconnect?.(),
        onStompError,
        onWebSocketClose,
    });

    return client;
};
