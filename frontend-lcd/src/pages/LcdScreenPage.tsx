import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { LcdLayout } from '../features/lcd/components/LcdLayout'
import { LcdModeScreen } from '../features/lcd/components/LcdModeScreens'
import { useLcdController } from '../features/lcd/hooks/useLcdController'
import type { LcdMode } from '../features/lcd/types'

const modeTitle: Record<LcdMode, string> = {
  IDLE: '대기 화면',
  GREETING: '인사 화면',
  MEDICATION: '복약 알림',
  SCHEDULE: '일정 알림',
  LISTENING: '듣는 중',
  EMERGENCY: '긴급 상황',
  SLEEP: '충전/수면',
}

function formatNow() {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date())
}

export function LcdScreenPage() {
  const { robotId } = useParams()
  const selectedRobotId = robotId?.trim() || '1'

  const {
    lcdState,
    isLoading,
    isSubmittingAction,
    statusMessage,
    errorMessage,
    connectionStatus,
    sendAction,
  } = useLcdController(selectedRobotId)

  const [nowLabel, setNowLabel] = useState(() => formatNow())
  const title = modeTitle[lcdState.mode]

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowLabel(formatNow())
    }, 30_000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <LcdLayout
      robotId={selectedRobotId}
      title={title}
      nowLabel={nowLabel}
      status={connectionStatus}
      errorMessage={errorMessage}
      noticeMessage={
        statusMessage ??
        (lcdState.lastUpdatedAt
          ? `마지막 업데이트 ${new Date(lcdState.lastUpdatedAt).toLocaleTimeString(
              'ko-KR',
            )}`
          : null)
      }
      loading={isLoading}
    >
      <LcdModeScreen
        state={lcdState}
        actionPending={isSubmittingAction}
        onAction={sendAction}
      />
    </LcdLayout>
  )
}
