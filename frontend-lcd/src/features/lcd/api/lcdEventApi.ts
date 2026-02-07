import { httpClient } from './httpClient'
import type { LcdActionType, LcdMode } from '../types'

export class MissingMedicationIdForTakeError extends Error {
  constructor() {
    super('TAKE 액션에는 medicationId가 필요합니다.')
    this.name = 'MissingMedicationIdForTakeError'
  }
}

interface LcdActionEventPayload {
  type: 'BUTTON'
  action: LcdActionType
  detectedAt: string
  medicationId?: number
  payload: {
    source: 'LCD_WEB'
    mode: LcdMode
    message?: string
  }
}

interface PostLcdActionEventInput {
  robotId: string
  action: LcdActionType
  mode: LcdMode
  message?: string
  medicationId?: number
  occurredAt?: string
}

function normalizeMedicationId(raw: number | undefined): number | undefined {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    return undefined
  }

  return raw
}

function ensureTakeMedicationId(
  action: LcdActionType,
  medicationId: number | undefined,
): number | undefined {
  if (action !== 'TAKE') {
    return undefined
  }

  const normalized = normalizeMedicationId(medicationId)
  if (normalized === undefined) {
    throw new MissingMedicationIdForTakeError()
  }

  return normalized
}

export function buildLcdActionEventRequest({
  action,
  mode,
  message,
  medicationId,
  occurredAt,
}: Omit<PostLcdActionEventInput, 'robotId'>): { events: LcdActionEventPayload[] } {
  const detectedAt = occurredAt ?? new Date().toISOString()
  const takeMedicationId = ensureTakeMedicationId(action, medicationId)
  const eventPayload: LcdActionEventPayload = {
    type: 'BUTTON',
    action,
    detectedAt,
    payload: {
      source: 'LCD_WEB',
      mode,
      message,
    },
  }

  if (takeMedicationId !== undefined) {
    eventPayload.medicationId = takeMedicationId
  }

  return {
    events: [eventPayload],
  }
}

export async function postLcdActionEvent(input: PostLcdActionEventInput) {
  const { robotId, ...rest } = input
  const request = buildLcdActionEventRequest(rest)
  return httpClient.post(`/api/robots/${robotId}/events`, request)
}

export function isMissingMedicationIdForTakeError(error: unknown): boolean {
  return error instanceof MissingMedicationIdForTakeError
}
