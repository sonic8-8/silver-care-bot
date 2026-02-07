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

function normalizeSchedule(raw: unknown): LcdSchedulePreview | null {
  if (!isRecord(raw)) {
    return null
  }

  const label = normalizeText(raw.label)
  const time = normalizeText(raw.time)

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

  return raw
}

export function normalizeLcdState(raw: unknown): LcdState {
  const payload = extractPayload(raw)

  return {
    mode: normalizeMode(payload.mode),
    emotion: normalizeEmotion(payload.emotion),
    message: normalizeText(payload.message),
    subMessage: normalizeText(payload.subMessage),
    nextSchedule: normalizeSchedule(payload.nextSchedule),
    lastUpdatedAt:
      normalizeText(payload.lastUpdatedAt) ||
      normalizeText(payload.updatedAt) ||
      null,
  }
}

export async function getRobotLcdState(robotId: string): Promise<LcdState> {
  const response = await httpClient.get(`/api/robots/${robotId}/lcd`)
  return normalizeLcdState(response.data)
}

