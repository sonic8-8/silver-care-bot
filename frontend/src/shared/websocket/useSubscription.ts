import { useEffect, useRef } from 'react';
import type { Client, IMessage, StompSubscription } from '@stomp/stompjs';

export type UseSubscriptionOptions<TPayload> = {
    client: Client | null;
    destination: string;
    onMessage: (payload: TPayload, message: IMessage) => void;
    enabled?: boolean;
    isConnected?: boolean;
};

export const useSubscription = <TPayload>({
    client,
    destination,
    onMessage,
    enabled = true,
    isConnected = true,
}: UseSubscriptionOptions<TPayload>) => {
    const subscriptionRef = useRef<StompSubscription | null>(null);

    useEffect(() => {
        if (!client || !enabled || !isConnected) {
            return;
        }

        const subscription = client.subscribe(destination, (message) => {
            let payload: TPayload;
            try {
                payload = JSON.parse(message.body) as TPayload;
            } catch (error) {
                payload = message.body as TPayload;
            }
            onMessage(payload, message);
        });

        subscriptionRef.current = subscription;

        return () => {
            subscriptionRef.current?.unsubscribe();
            subscriptionRef.current = null;
        };
    }, [client, destination, enabled, isConnected, onMessage]);
};
