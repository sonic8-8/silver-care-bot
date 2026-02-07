import { describe, expect, it } from 'vitest'
import { buildLcdActionEventRequest } from './lcdEventApi'

describe('buildLcdActionEventRequest', () => {
  it('LCD 버튼 액션 payload를 events 배열 형식으로 생성한다', () => {
    const request = buildLcdActionEventRequest({
      action: 'TAKE',
      mode: 'MEDICATION',
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
        },
      ],
    })
  })
})

