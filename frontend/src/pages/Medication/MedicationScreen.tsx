import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';

function MedicationScreen() {
    return (
        <GuardianAppContainer title="약 관리" description="복약 일정과 기록을 관리합니다.">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                <h2 className="text-sm font-semibold text-gray-500">복약 목록</h2>
                <div className="mt-4 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                        <span>혈압약</span>
                        <span className="font-semibold text-gray-900">아침</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>비타민</span>
                        <span className="font-semibold text-gray-900">점심</span>
                    </div>
                </div>
                <button
                    type="button"
                    className="mt-6 min-h-[48px] w-full rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                >
                    약 추가
                </button>
            </div>
        </GuardianAppContainer>
    );
}

export default MedicationScreen;
