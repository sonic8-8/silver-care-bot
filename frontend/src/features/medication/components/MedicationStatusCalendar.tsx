import type { DailyMedicationStatus, MedicationIntakeStatus } from '../types';

type MedicationStatusCalendarProps = {
    dailyStatus: DailyMedicationStatus[];
};

const dayLabelMap: Record<DailyMedicationStatus['day'], string> = {
    MON: '월',
    TUE: '화',
    WED: '수',
    THU: '목',
    FRI: '금',
    SAT: '토',
    SUN: '일',
};

const statusLabelMap: Record<MedicationIntakeStatus, string> = {
    TAKEN: '복용',
    MISSED: '미복용',
    PENDING: '대기',
};

const statusClassMap: Record<MedicationIntakeStatus, string> = {
    TAKEN: 'bg-safe-bg text-safe',
    MISSED: 'bg-danger-bg text-danger',
    PENDING: 'bg-gray-100 text-gray-500',
};

export function MedicationStatusCalendar({ dailyStatus }: MedicationStatusCalendarProps) {
    if (dailyStatus.length === 0) {
        return (
            <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                <h2 className="text-sm font-semibold text-gray-500">일별 복약 상태</h2>
                <p className="mt-4 text-sm text-gray-500">표시할 캘린더 데이터가 없습니다.</p>
            </article>
        );
    }

    return (
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold text-gray-500">일별 복약 상태</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {dailyStatus.map((item) => (
                    <div key={item.day} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                        <p className="text-sm font-semibold text-gray-900">{dayLabelMap[item.day]}요일</p>
                        <div className="mt-2 grid gap-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">아침</span>
                                <span className={`rounded-full px-2 py-1 font-semibold ${statusClassMap[item.morning]}`}>
                                    {statusLabelMap[item.morning]}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">저녁</span>
                                <span className={`rounded-full px-2 py-1 font-semibold ${statusClassMap[item.evening]}`}>
                                    {statusLabelMap[item.evening]}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </article>
    );
}
