import { httpClient } from './httpClient'
import {
  DEFAULT_LCD_STATE,
  LCD_EMOTIONS,
  LCD_MODES,
  type LcdEmotion,
  type LcdMode,
  type LcdSchedulePreview,
  type LcdState,
} from '../types'

interface ApiEnvelope {
  data?: unknown
  payload?: unknown
  result?: unknown
  body?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeMode(rawMode: unknown): LcdMode {
  if (typeof rawMode !== 'string') {
    return DEFAULT_LCD_STATE.mode
  }

  const upper = rawMode.toUpperCase()
  return LCD_MODES.includes(upper as LcdMode)
    ? (upper as LcdMode)
    : DEFAULT_LCD_STATE.mode
}

function normalizeEmotion(rawEmotion: unknown): LcdEmotion {
  if (typeof rawEmotion !== 'string') {
    return DEFAULT_LCD_STATE.emotion
  }

  const lower = rawEmotion.toLowerCase()
  return LCD_EMOTIONS.includes(lower as LcdEmotion)
    ? (lower as LcdEmotion)
    : DEFAULT_LCD_STATE.emotion
}

function normalizeText(rawText: unknown): string {
  return typeof rawText === 'string' ? rawText : ''
}

function pickField(
  payload: Record<string, unknown>,
  keys: readonly string[],
): unknown {
  for (const key of keys) {
    if (key in payload) {
      return payload[key]
    }
  }
  return undefined
}

function normalizeMedicationId(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw
  }

  if (typeof raw === 'string' && raw.trim()) {
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function normalizeSchedule(raw: unknown): LcdSchedulePreview | null {
  if (!isRecord(raw)) {
    return null
  }

  const label = normalizeText(pickField(raw, ['label', 'title', 'name']))
  const time = normalizeText(pickField(raw, ['time', 'at']))

  if (!label && !time) {
    return null
  }

  return {
    label,
    time,
  }
}

function extractPayload(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) {
    return {}
  }

  const envelope = raw as ApiEnvelope
  if (isRecord(envelope.data)) {
    return envelope.data
  }

  if (isRecord(envelope.payload)) {
    return envelope.payload
  }

  if (isRecord(envelope.result)) {
    return envelope.result
  }

  if (isRecord(envelope.body)) {
    if (isRecord(envelope.body.data)) {
      return envelope.body.data
    }

    if (isRecord(envelope.body.payload)) {
      return envelope.body.payload
    }
  }

  return raw
}

export function normalizeLcdState(raw: unknown): LcdState {
  const payload = extractPayload(raw)
  const mode = pickField(payload, ['mode', 'lcdMode'])
  const emotion = pickField(payload, ['emotion', 'lcdEmotion'])
  const message = pickField(payload, ['message', 'mainMessage'])
  const subMessage = pickField(payload, ['subMessage', 'sub_message', 'subtitle'])
  const medicationId = pickField(payload, ['medicationId', 'medication_id'])
  const nextSchedule = pickField(payload, ['nextSchedule', 'next_schedule'])
  const lastUpdatedAt = pickField(payload, [
    'lastUpdatedAt',
    'last_updated_at',
    'updatedAt',
    'timestamp',
  ])

  return {
    mode: normalizeMode(mode),
    emotion: normalizeEmotion(emotion),
    message: normalizeText(message),
    subMessage: normalizeText(subMessage),
    medicationId: normalizeMedicationId(medicationId),
    nextSchedule: normalizeSchedule(nextSchedule),
    lastUpdatedAt: normalizeText(lastUpdatedAt) || null,
  }
}

export async function getRobotLcdState(robotId: string): Promise<LcdState> {
  const response = await httpClient.get(`/api/robots/${robotId}/lcd`)
  return normalizeLcdState(response.data)
}
