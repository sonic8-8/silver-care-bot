import type { WeeklyMedicationStatus } from '../types';

type WeeklyMedicationChartProps = {
    weeklyStatus?: WeeklyMedicationStatus;
};

export function WeeklyMedicationChart({ weeklyStatus }: WeeklyMedicationChartProps) {
    if (!weeklyStatus || weeklyStatus.total <= 0) {
        return (
            <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                <h2 className="text-sm font-semibold text-gray-500">주간 복용률</h2>
                <p className="mt-4 text-sm text-gray-500">아직 집계된 복약 데이터가 없습니다.</p>
            </article>
        );
    }

    const pendingCount = Math.max(weeklyStatus.total - weeklyStatus.taken - weeklyStatus.missed, 0);

    return (
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-sm font-semibold text-gray-500">주간 복용률</h2>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{weeklyStatus.rate.toFixed(1)}%</p>
                    <p className="mt-1 text-xs text-gray-500">
                        총 {weeklyStatus.total}회 중 {weeklyStatus.taken}회 완료
                    </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-right">
                    <p className="text-xs text-gray-500">완료/미복용/대기</p>
                    <p className="text-sm font-semibold text-gray-900">
                        {weeklyStatus.taken}/{weeklyStatus.missed}/{pendingCount}
                    </p>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                        <span>복용 완료</span>
                        <span>{weeklyStatus.taken}회</span>
                    </div>
                    <progress
                        className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-gray-100 [&::-webkit-progress-value]:bg-safe"
                        max={weeklyStatus.total}
                        value={weeklyStatus.taken}
                    />
                </div>
                <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                        <span>미복용</span>
                        <span>{weeklyStatus.missed}회</span>
                    </div>
                    <progress
                        className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-gray-100 [&::-webkit-progress-value]:bg-danger"
                        max={weeklyStatus.total}
                        value={weeklyStatus.missed}
                    />
                </div>
                <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                        <span>대기</span>
                        <span>{pendingCount}회</span>
                    </div>
                    <progress
                        className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-gray-100 [&::-webkit-progress-value]:bg-gray-400"
                        max={weeklyStatus.total}
                        value={pendingCount}
                    />
                </div>
            </div>
        </article>
    );
}
