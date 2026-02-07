import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import {
  getAuthToken,
  isMissingAuthTokenError,
} from '../auth/authToken'
import { getRobotLcdState } from '../api/lcdApi'
import {
  isMissingMedicationIdForTakeError,
  postLcdActionEvent,
} from '../api/lcdEventApi'
import {
  DEFAULT_LCD_STATE,
  type LcdActionType,
  type LcdState,
} from '../types'
import { useLcdRealtime } from './useLcdRealtime'

export function useLcdController(robotId: string) {
  const hasAuthToken = Boolean(getAuthToken())
  const [lcdState, setLcdState] = useState<LcdState>(DEFAULT_LCD_STATE)
  const [isLoading, setIsLoading] = useState(hasAuthToken)
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
    if (!hasAuthToken) {
      return
    }

    let disposed = false

    async function load() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const state = await getRobotLcdState(robotId)
        if (!disposed) {
          setLcdState(state)
        }
      } catch (error: unknown) {
        if (!disposed) {
          if (isMissingAuthTokenError(error)) {
            setErrorMessage('인증 토큰이 없어 LCD에 연결할 수 없습니다. URL token을 확인해 주세요.')
            return
          }

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
  }, [hasAuthToken, robotId])

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
          medicationId:
            action === 'TAKE' ? (lcdState.medicationId ?? undefined) : undefined,
        })
      } catch (error: unknown) {
        if (isMissingAuthTokenError(error)) {
          setErrorMessage('인증 토큰이 없어 버튼 요청을 전송할 수 없습니다. URL token을 확인해 주세요.')
          return
        }

        if (isMissingMedicationIdForTakeError(error)) {
          setErrorMessage(
            '복약 정보가 확인되지 않아 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.',
          )
          return
        }

        if (
          action === 'TAKE' &&
          axios.isAxiosError(error) &&
          error.response?.status === 400
        ) {
          setErrorMessage(
            '복약 정보가 확인되지 않아 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.',
          )
          return
        }

        setErrorMessage('버튼 이벤트 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      } finally {
        setIsSubmittingAction(false)
      }
    },
    [lcdState.medicationId, lcdState.message, lcdState.mode, robotId],
  )

  return {
    lcdState,
    isLoading,
    isSubmittingAction,
    errorMessage:
      errorMessage ??
      (hasAuthToken
        ? null
        : '인증 토큰이 없어 LCD에 연결할 수 없습니다. URL token을 포함해 접속해 주세요.'),
    connectionStatus,
    sendAction,
  }
}
