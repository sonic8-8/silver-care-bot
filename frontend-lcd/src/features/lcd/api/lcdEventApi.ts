import { httpClient } from './httpClient'
import type { LcdActionType, LcdMode } from '../types'

interface LcdActionEventPayload {
  type: 'LCD_BUTTON'
  action: LcdActionType
  mode: LcdMode
  detectedAt: string
  source: 'LCD_WEB'
  message?: string
}

interface PostLcdActionEventInput {
  robotId: string
  action: LcdActionType
  mode: LcdMode
  message?: string
  occurredAt?: string
}

export function buildLcdActionEventRequest({
  action,
  mode,
  message,
  occurredAt,
}: Omit<PostLcdActionEventInput, 'robotId'>): { events: LcdActionEventPayload[] } {
  const detectedAt = occurredAt ?? new Date().toISOString()

  return {
    events: [
      {
        type: 'LCD_BUTTON',
        action,
        mode,
        detectedAt,
        source: 'LCD_WEB',
        message,
      },
    ],
  }
}

export async function postLcdActionEvent(input: PostLcdActionEventInput) {
  const { robotId, ...rest } = input
  const request = buildLcdActionEventRequest(rest)
  return httpClient.post(`/api/robots/${robotId}/events`, request)
}

