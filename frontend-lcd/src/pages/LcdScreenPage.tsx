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
    errorMessage,
    connectionStatus,
    sendAction,
  } = useLcdController(selectedRobotId)

  const nowLabel = formatNow()
  const title = modeTitle[lcdState.mode]

  return (
    <LcdLayout
      robotId={selectedRobotId}
      title={title}
      nowLabel={nowLabel}
      status={connectionStatus}
      lastUpdatedAt={lcdState.lastUpdatedAt}
      errorMessage={errorMessage}
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
