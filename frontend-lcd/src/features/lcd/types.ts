export const LCD_MODES = [
  'IDLE',
  'GREETING',
  'MEDICATION',
  'SCHEDULE',
  'LISTENING',
  'EMERGENCY',
  'SLEEP',
] as const

export type LcdMode = (typeof LCD_MODES)[number]

export const LCD_EMOTIONS = ['neutral', 'happy', 'sleep'] as const
export type LcdEmotion = (typeof LCD_EMOTIONS)[number]

export type LcdConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'

export type LcdActionType = 'TAKE' | 'LATER' | 'CONFIRM' | 'EMERGENCY'

export interface LcdSchedulePreview {
  label: string
  time: string
}

export interface LcdState {
  mode: LcdMode
  emotion: LcdEmotion
  message: string
  subMessage: string
  medicationId: number | null
  nextSchedule: LcdSchedulePreview | null
  lastUpdatedAt: string | null
}

export interface LcdWebSocketEnvelope {
  type?: string
  payload?: Record<string, unknown>
  timestamp?: string
}

export const DEFAULT_LCD_STATE: LcdState = {
  mode: 'IDLE',
  emotion: 'neutral',
  message: '할머니~ 오늘도 편안한 하루 보내세요!',
  subMessage: '',
  medicationId: null,
  nextSchedule: null,
  lastUpdatedAt: null,
}
