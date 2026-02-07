import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useEffect, useMemo, useState } from 'react'
import {
  appendTokenQuery,
  getAuthToken,
  getAuthorizationHeaderValue,
} from '../auth/authToken'
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
  const authHeader = useMemo(() => getAuthorizationHeaderValue(), [])
  const wsEndpointWithToken = useMemo(() => {
    const token = getAuthToken()
    return token ? appendTokenQuery(wsEndpoint, token) : wsEndpoint
  }, [wsEndpoint])

  useEffect(() => {
    if (!authHeader) {
      return
    }

    const client = new Client({
      reconnectDelay: 4_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      connectHeaders: {
        Authorization: authHeader,
      },
      webSocketFactory: () => new SockJS(wsEndpointWithToken),
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
  }, [authHeader, onModeChange, robotId, wsEndpointWithToken])

  return authHeader ? connectionStatus : 'error'
}
