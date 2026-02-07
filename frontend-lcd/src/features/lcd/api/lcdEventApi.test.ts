import { describe, expect, it } from 'vitest'
import { buildLcdActionEventRequest } from './lcdEventApi'

describe('buildLcdActionEventRequest', () => {
  it('TAKE 액션이면 medicationId를 포함해 payload를 생성한다', () => {
    const request = buildLcdActionEventRequest({
      action: 'TAKE',
      mode: 'MEDICATION',
      medicationId: 91,
      message: '복약 확인',
      occurredAt: '2026-02-08T00:00:00.000Z',
    })

    expect(request).toEqual({
      events: [
        {
          type: 'BUTTON',
          action: 'TAKE',
          detectedAt: '2026-02-08T00:00:00.000Z',
          medicationId: 91,
          payload: {
            source: 'LCD_WEB',
            mode: 'MEDICATION',
            message: '복약 확인',
          },
        },
      ],
    })
  })

  it('TAKE가 아닌 액션이면 medicationId를 넣지 않는다', () => {
    const request = buildLcdActionEventRequest({
      action: 'LATER',
      mode: 'MEDICATION',
      medicationId: 91,
      occurredAt: '2026-02-08T00:00:00.000Z',
    })

    expect(request.events[0]).not.toHaveProperty('medicationId')
    expect(request.events[0]).toMatchObject({
      type: 'BUTTON',
      action: 'LATER',
      payload: {
        source: 'LCD_WEB',
        mode: 'MEDICATION',
      },
    })
  })

  it('TAKE 액션에 medicationId가 없으면 즉시 실패한다', () => {
    expect(() =>
      buildLcdActionEventRequest({
        action: 'TAKE',
        mode: 'MEDICATION',
        occurredAt: '2026-02-08T00:00:00.000Z',
      }),
    ).toThrow('TAKE 액션에는 medicationId가 필요합니다.')
  })
})
