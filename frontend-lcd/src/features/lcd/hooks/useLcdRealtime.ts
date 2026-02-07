import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useEffect, useMemo, useState } from 'react'
import { normalizeLcdState } from '../api/lcdApi'
import type { LcdConnectionStatus, LcdState, LcdWebSocketEnvelope } from '../types'

interface UseLcdRealtimeParams {
  robotId: string
  onModeChange: (nextState: LcdState) => void
}

function isEnvelope(value: unknown): value is LcdWebSocketEnvelope {
  return typeof value === 'object' && value !== null
}

export function useLcdRealtime({ robotId, onModeChange }: UseLcdRealtimeParams) {
  const [connectionStatus, setConnectionStatus] =
    useState<LcdConnectionStatus>('connecting')

  const wsEndpoint = useMemo(() => import.meta.env.VITE_WS_URL ?? '/ws', [])

  useEffect(() => {
    const client = new Client({
      reconnectDelay: 4_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      webSocketFactory: () => new SockJS(wsEndpoint),
    })

    client.onConnect = () => {
      setConnectionStatus('connected')
      client.subscribe(`/topic/robot/${robotId}/lcd`, (frame) => {
        try {
          const parsed = JSON.parse(frame.body) as unknown
          if (!isEnvelope(parsed)) {
            onModeChange(normalizeLcdState(parsed))
            return
          }

          if (parsed.type && parsed.type !== 'LCD_MODE_CHANGE') {
            return
          }

          onModeChange(normalizeLcdState(parsed.payload ?? parsed))
        } catch {
          setConnectionStatus('error')
        }
      })
    }

    client.onStompError = () => {
      setConnectionStatus('error')
    }

    client.onWebSocketError = () => {
      setConnectionStatus('error')
    }

    client.onWebSocketClose = () => {
      setConnectionStatus('disconnected')
    }

    void client.activate()

    return () => {
      void client.deactivate()
    }
  }, [onModeChange, robotId, wsEndpoint])

  return connectionStatus
}
