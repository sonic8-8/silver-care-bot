import { useCallback, useEffect, useState } from 'react'
import { getRobotLcdState } from '../api/lcdApi'
import { postLcdActionEvent } from '../api/lcdEventApi'
import {
  DEFAULT_LCD_STATE,
  type LcdActionType,
  type LcdState,
} from '../types'
import { useLcdRealtime } from './useLcdRealtime'

export function useLcdController(robotId: string) {
  const [lcdState, setLcdState] = useState<LcdState>(DEFAULT_LCD_STATE)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onModeChange = useCallback((next: LcdState) => {
    setLcdState(next)
  }, [])

  const connectionStatus = useLcdRealtime({
    robotId,
    onModeChange,
  })

  useEffect(() => {
    let disposed = false

    async function load() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const state = await getRobotLcdState(robotId)
        if (!disposed) {
          setLcdState(state)
        }
      } catch {
        if (!disposed) {
          setErrorMessage('LCD 상태를 불러오지 못했습니다. 연결 상태를 확인해 주세요.')
        }
      } finally {
        if (!disposed) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      disposed = true
    }
  }, [robotId])

  const sendAction = useCallback(
    async (action: LcdActionType) => {
      setIsSubmittingAction(true)
      setErrorMessage(null)

      try {
        await postLcdActionEvent({
          robotId,
          action,
          mode: lcdState.mode,
          message: lcdState.message,
        })
      } catch {
        setErrorMessage('버튼 이벤트 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      } finally {
        setIsSubmittingAction(false)
      }
    },
    [lcdState.message, lcdState.mode, robotId],
  )

  return {
    lcdState,
    isLoading,
    isSubmittingAction,
    errorMessage,
    connectionStatus,
    sendAction,
  }
}

