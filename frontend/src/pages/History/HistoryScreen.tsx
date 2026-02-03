import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';

function HistoryScreen() {
    return (
        <GuardianAppContainer title="기록" description="활동 로그와 리포트를 확인합니다.">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                <h2 className="text-sm font-semibold text-gray-500">오늘의 기록</h2>
                <ul className="mt-4 space-y-3 text-sm text-gray-600">
                    <li className="flex items-center justify-between">
                        <span>기상</span>
                        <span className="font-semibold text-gray-900">07:20</span>
                    </li>
                    <li className="flex items-center justify-between">
                        <span>식사</span>
                        <span className="font-semibold text-gray-900">12:10</span>
                    </li>
                </ul>
            </div>
        </GuardianAppContainer>
    );
}

export default HistoryScreen;
