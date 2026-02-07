import { describe, expect, it } from 'vitest'
import { normalizeLcdState } from './lcdApi'

describe('normalizeLcdState', () => {
  it('success envelope 형식의 LCD 응답을 파싱한다', () => {
    const normalized = normalizeLcdState({
      success: true,
      data: {
        mode: 'medication',
        emotion: 'happy',
        message: '약 드실 시간이에요!',
        subMessage: '아침약 (고혈압)',
        medicationId: 15,
        nextSchedule: {
          label: '병원 방문',
          time: '14:00',
        },
        lastUpdatedAt: '2026-02-08T00:00:00+09:00',
      },
    })

    expect(normalized.mode).toBe('MEDICATION')
    expect(normalized.emotion).toBe('happy')
    expect(normalized.medicationId).toBe(15)
    expect(normalized.nextSchedule?.label).toBe('병원 방문')
    expect(normalized.lastUpdatedAt).toBe('2026-02-08T00:00:00+09:00')
  })

  it('알 수 없는 모드/표정이면 안전한 기본값으로 치환한다', () => {
    const normalized = normalizeLcdState({
      payload: {
        mode: 'unknown-mode',
        emotion: 'angry',
      },
    })

    expect(normalized.mode).toBe('IDLE')
    expect(normalized.emotion).toBe('neutral')
  })

  it('medicationId가 문자열이어도 숫자로 변환한다', () => {
    const normalized = normalizeLcdState({
      data: {
        mode: 'MEDICATION',
        emotion: 'happy',
        medicationId: '27',
      },
    })

    expect(normalized.medicationId).toBe(27)
  })
})
