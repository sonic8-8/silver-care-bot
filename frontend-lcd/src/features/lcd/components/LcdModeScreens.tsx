import type { ReactNode } from 'react'
import { LcdActionButton } from './LcdActionButton'
import type { LcdActionType, LcdEmotion, LcdMode, LcdState } from '../types'

interface LcdModeScreenProps {
  state: LcdState
  actionPending: boolean
  onAction: (action: LcdActionType) => void
}

const emotionEmoji: Record<LcdEmotion, string> = {
  neutral: '🙂',
  happy: '😊',
  sleep: '😴',
}

const modeTitle: Record<LcdMode, string> = {
  IDLE: '대기 화면',
  GREETING: '인사 화면',
  MEDICATION: '복약 알림',
  SCHEDULE: '일정 알림',
  LISTENING: '듣는 중',
  EMERGENCY: '긴급 상황',
  SLEEP: '충전/수면',
}

function ScreenFrame({
  title,
  icon,
  message,
  subMessage,
  children,
}: {
  title: string
  icon: string
  message: string
  subMessage: string
  children?: ReactNode
}) {
  return (
    <article className="lcd-screen">
      <p className="lcd-screen-title">{title}</p>
      <p className="lcd-screen-icon" aria-label="emotion-icon">
        {icon}
      </p>
      <p className="lcd-screen-message">{message || '할머니~ 상태를 확인하고 있어요.'}</p>
      {subMessage && <p className="lcd-screen-submessage">{subMessage}</p>}
      {children}
    </article>
  )
}

function IdleScreen({ state }: Pick<LcdModeScreenProps, 'state'>) {
  return (
    <ScreenFrame
      title={modeTitle.IDLE}
      icon={emotionEmoji[state.emotion]}
      message={state.message || '할머니~ 오늘도 좋은 하루 되세요!'}
      subMessage={state.subMessage}
    >
      {state.nextSchedule && (
        <div className="lcd-schedule-card">
          <p>📅 다음 일정: {state.nextSchedule.label}</p>
          <p>⏰ {state.nextSchedule.time}</p>
        </div>
      )}
    </ScreenFrame>
  )
}

function GreetingScreen({ state }: Pick<LcdModeScreenProps, 'state'>) {
  return (
    <ScreenFrame
      title={modeTitle.GREETING}
      icon="☀️"
      message={state.message || '할머니~ 잘 주무셨어요?'}
      subMessage={state.subMessage || '오늘도 제가 곁에서 도와드릴게요.'}
    />
  )
}

function MedicationScreen({ state, actionPending, onAction }: LcdModeScreenProps) {
  return (
    <ScreenFrame
      title={modeTitle.MEDICATION}
      icon="💊"
      message={state.message || '할머니~ 약 드실 시간이에요!'}
      subMessage={state.subMessage || '복약 여부를 버튼으로 알려주세요.'}
    >
      <div className="lcd-action-row">
        <LcdActionButton
          variant="primary"
          disabled={actionPending}
          onClick={() => onAction('TAKE')}
        >
          응, 먹었어~
        </LcdActionButton>
        <LcdActionButton
          variant="secondary"
          disabled={actionPending}
          onClick={() => onAction('LATER')}
        >
          아직이야~
        </LcdActionButton>
      </div>
    </ScreenFrame>
  )
}

function ScheduleScreen({ state, actionPending, onAction }: LcdModeScreenProps) {
  return (
    <ScreenFrame
      title={modeTitle.SCHEDULE}
      icon="📅"
      message={state.message || '할머니~ 곧 일정이 있어요!'}
      subMessage={state.subMessage}
    >
      {state.nextSchedule && (
        <div className="lcd-schedule-card">
          <p>일정: {state.nextSchedule.label}</p>
          <p>시간: {state.nextSchedule.time}</p>
        </div>
      )}

      <div className="lcd-action-row lcd-action-row--single">
        <LcdActionButton
          variant="primary"
          disabled={actionPending}
          onClick={() => onAction('CONFIRM')}
        >
          응, 알겠어~
        </LcdActionButton>
      </div>
    </ScreenFrame>
  )
}

function ListeningScreen({ state }: Pick<LcdModeScreenProps, 'state'>) {
  return (
    <ScreenFrame
      title={modeTitle.LISTENING}
      icon="🎤"
      message={state.message || '이야기를 듣는 중이에요...'}
      subMessage={state.subMessage}
    >
      <div className="lcd-listening-bars" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </ScreenFrame>
  )
}

function EmergencyScreen({ state, actionPending, onAction }: LcdModeScreenProps) {
  return (
    <article className="lcd-screen lcd-screen--emergency">
      <p className="lcd-screen-title">{modeTitle.EMERGENCY}</p>
      <p className="lcd-screen-icon">🚨</p>
      <p className="lcd-screen-message">{state.message || '할머니! 괜찮으세요?'}</p>
      {state.subMessage && <p className="lcd-screen-submessage">{state.subMessage}</p>}
      <div className="lcd-action-column">
        <LcdActionButton
          variant="primary"
          disabled={actionPending}
          onClick={() => onAction('CONFIRM')}
        >
          괜찮아~
        </LcdActionButton>
        <LcdActionButton
          variant="danger"
          disabled={actionPending}
          onClick={() => onAction('EMERGENCY')}
        >
          도와줘!
        </LcdActionButton>
      </div>
      <p className="lcd-emergency-guide">30초 내 응답이 없으면 보호자에게 자동 알림됩니다.</p>
    </article>
  )
}

function SleepScreen({ state }: Pick<LcdModeScreenProps, 'state'>) {
  return (
    <ScreenFrame
      title={modeTitle.SLEEP}
      icon="😴"
      message={state.message || '할머니~ 저 충전할게요.'}
      subMessage={state.subMessage || '안녕히 주무세요.'}
    >
      <div className="lcd-charge-bar-wrap">
        <div className="lcd-charge-bar" />
      </div>
      <p className="lcd-charge-label">충전 중...</p>
    </ScreenFrame>
  )
}

export function LcdModeScreen({
  state,
  actionPending,
  onAction,
}: LcdModeScreenProps) {
  switch (state.mode) {
    case 'IDLE':
      return <IdleScreen state={state} />
    case 'GREETING':
      return <GreetingScreen state={state} />
    case 'MEDICATION':
      return (
        <MedicationScreen
          state={state}
          actionPending={actionPending}
          onAction={onAction}
        />
      )
    case 'SCHEDULE':
      return (
        <ScheduleScreen
          state={state}
          actionPending={actionPending}
          onAction={onAction}
        />
      )
    case 'LISTENING':
      return <ListeningScreen state={state} />
    case 'EMERGENCY':
      return (
        <EmergencyScreen
          state={state}
          actionPending={actionPending}
          onAction={onAction}
        />
      )
    case 'SLEEP':
      return <SleepScreen state={state} />
    default:
      return <IdleScreen state={state} />
  }
}
