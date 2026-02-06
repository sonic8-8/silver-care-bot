import type { EmergencyDetail } from '@/shared/types';

const typeLabels: Record<string, string> = {
    FALL_DETECTED: '낙상 감지',
    NO_RESPONSE: '무응답',
    SOS_BUTTON: 'SOS 버튼',
    UNUSUAL_PATTERN: '비정상 패턴',
};

const formatDate = (value?: string | null) => {
    if (!value) {
        return '시간 정보 없음';
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

type EmergencyAlertProps = {
    emergency: EmergencyDetail;
};

export function EmergencyAlert({ emergency }: EmergencyAlertProps) {
    return (
        <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-left">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">긴급 상황</p>
            <h1 className="mt-3 text-2xl font-semibold text-white">
                {typeLabels[emergency.type] ?? emergency.type}
            </h1>
            <div className="mt-4 space-y-2 text-sm text-white/80">
                <p>발생 위치: {emergency.location ?? '확인 중'}</p>
                <p>감지 시간: {formatDate(emergency.detectedAt)}</p>
            </div>
        </div>
    );
}
