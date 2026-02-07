import type { PropsWithChildren } from 'react'
import type { LcdConnectionStatus } from '../types'
import { StatusBar } from './StatusBar'

interface LcdLayoutProps extends PropsWithChildren {
  robotId: string
  title: string
  nowLabel: string
  status: LcdConnectionStatus
  errorMessage: string | null
  noticeMessage: string | null
  loading: boolean
  batteryLevel?: number | null
}

export function LcdLayout({
  robotId,
  title,
  nowLabel,
  status,
  errorMessage,
  noticeMessage,
  loading,
  batteryLevel,
  children,
}: LcdLayoutProps) {
  return (
    <main className="lcd-shell">
      <StatusBar
        nowLabel={nowLabel}
        status={status}
        robotId={robotId}
        batteryLevel={batteryLevel}
      />

      <div className="lcd-title-block">
        <p className="lcd-title">현재 화면</p>
        <h1 className="lcd-mode-title">{title}</h1>
      </div>

      {errorMessage && (
        <p className="lcd-error-banner" role="alert">
          {errorMessage}
        </p>
      )}
      {noticeMessage && !errorMessage && (
        <p className="lcd-notice-banner" role="status" aria-live="polite">
          {noticeMessage}
        </p>
      )}

      <section className="lcd-content">
        {loading && <div className="lcd-loading-overlay">초기 상태를 불러오는 중...</div>}
        {children}
      </section>
    </main>
  )
}
