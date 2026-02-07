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
          type: 'LCD_BUTTON',
          action: 'TAKE',
          mode: 'MEDICATION',
          detectedAt: '2026-02-08T00:00:00.000Z',
          source: 'LCD_WEB',
          message: '복약 확인',
          medicationId: 91,
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
  })
})
