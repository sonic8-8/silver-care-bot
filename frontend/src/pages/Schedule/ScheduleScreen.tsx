import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';

function ScheduleScreen() {
    return (
        <GuardianAppContainer title="일정" description="주간 일정을 관리합니다.">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                <h2 className="text-sm font-semibold text-gray-500">이번 주 일정</h2>
                <div className="mt-4 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                        <span>병원 방문</span>
                        <span className="font-semibold text-gray-900">화요일 10:00</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>복지사 방문</span>
                        <span className="font-semibold text-gray-900">목요일 14:00</span>
                    </div>
                </div>
                <button
                    type="button"
                    className="mt-6 min-h-[48px] w-full rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                >
                    일정 추가
                </button>
            </div>
        </GuardianAppContainer>
    );
}

export default ScheduleScreen;
