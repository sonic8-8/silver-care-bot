import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';

function DashboardScreen() {
    return (
        <GuardianAppContainer title="대시보드" description="오늘의 상태 요약을 확인합니다.">
            <section className="grid gap-4 md:grid-cols-2">
                <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                    <h2 className="text-sm font-semibold text-gray-500">오늘의 요약</h2>
                    <div className="mt-4 grid gap-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">기상 시간</span>
                            <span className="font-semibold text-gray-900">07:20</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">복용 상태</span>
                            <span className="font-semibold text-gray-900">아침 완료</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">활동 상태</span>
                            <span className="font-semibold text-gray-900">안정</span>
                        </div>
                    </div>
                </article>
                <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                    <h2 className="text-sm font-semibold text-gray-500">로봇 상태</h2>
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                            <span>배터리</span>
                            <span className="font-semibold text-gray-900">78%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>연결 상태</span>
                            <span className="font-semibold text-gray-900">연결됨</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>현재 위치</span>
                            <span className="font-semibold text-gray-900">거실</span>
                        </div>
                    </div>
                </article>
            </section>
            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                <h2 className="text-sm font-semibold text-gray-500">최근 알림</h2>
                <ul className="mt-4 space-y-3 text-sm text-gray-600">
                    <li className="flex items-center justify-between">
                        <span>복약 알림이 전송되었습니다.</span>
                        <span className="text-xs text-gray-400">10분 전</span>
                    </li>
                    <li className="flex items-center justify-between">
                        <span>로봇이 거실로 이동했습니다.</span>
                        <span className="text-xs text-gray-400">1시간 전</span>
                    </li>
                </ul>
            </section>
        </GuardianAppContainer>
    );
}

export default DashboardScreen;
