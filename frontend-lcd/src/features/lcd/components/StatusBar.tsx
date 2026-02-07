import type { LcdConnectionStatus } from '../types'

interface StatusBarProps {
  nowLabel: string
  status: LcdConnectionStatus
  robotId: string
  batteryLevel?: number | null
}

const statusLabelMap: Record<LcdConnectionStatus, string> = {
  connecting: '연결 중',
  connected: '실시간 연결됨',
  disconnected: '연결 끊김',
  error: '연결 오류',
}

function normalizeBatteryLevel(value?: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  return Math.max(0, Math.min(100, Math.round(value)))
}

export function StatusBar({
  nowLabel,
  status,
  robotId,
  batteryLevel,
}: StatusBarProps) {
  const normalizedBattery = normalizeBatteryLevel(batteryLevel)

  return (
    <header className="lcd-status-bar" aria-label="lcd-status-bar">
      <p className="lcd-clock" aria-live="polite">
        {nowLabel}
      </p>
      <div className="lcd-meta">
        <span className={`lcd-chip lcd-chip--${status}`}>{statusLabelMap[status]}</span>
        <span className="lcd-chip">Robot #{robotId}</span>
        <span className="lcd-chip lcd-chip--battery">
          배터리 {normalizedBattery === null ? '확인중' : `${normalizedBattery}%`}
          <span className="lcd-battery-gauge" aria-hidden="true">
            <span
              className="lcd-battery-gauge-fill"
              style={{
                width: `${normalizedBattery ?? 32}%`,
              }}
            />
          </span>
        </span>
      </div>
    </header>
  )
}
