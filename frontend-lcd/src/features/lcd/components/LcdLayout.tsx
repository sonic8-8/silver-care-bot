import type { PropsWithChildren } from 'react'
import type { LcdConnectionStatus } from '../types'

interface LcdLayoutProps extends PropsWithChildren {
  robotId: string
  title: string
  nowLabel: string
  status: LcdConnectionStatus
  lastUpdatedAt: string | null
  errorMessage: string | null
  loading: boolean
}

const statusLabelMap: Record<LcdConnectionStatus, string> = {
  connecting: '연결 중',
  connected: '실시간 연결됨',
  disconnected: '연결 끊김',
  error: '연결 오류',
}

export function LcdLayout({
  robotId,
  title,
  nowLabel,
  status,
  lastUpdatedAt,
  errorMessage,
  loading,
  children,
}: LcdLayoutProps) {
  return (
    <main className="lcd-shell">
      <header className="lcd-header">
        <div>
          <p className="lcd-clock">{nowLabel}</p>
          <p className="lcd-title">{title}</p>
        </div>
        <div className="lcd-meta">
          <span className={`lcd-chip lcd-chip--${status}`}>{statusLabelMap[status]}</span>
          <span className="lcd-chip">Robot #{robotId}</span>
          {lastUpdatedAt && (
            <span className="lcd-chip">
              업데이트 {new Date(lastUpdatedAt).toLocaleTimeString('ko-KR')}
            </span>
          )}
        </div>
      </header>

      {errorMessage && <p className="lcd-error-banner">{errorMessage}</p>}

      <section className="lcd-content">
        {loading && <div className="lcd-loading-overlay">초기 상태를 불러오는 중...</div>}
        {children}
      </section>
    </main>
  )
}

