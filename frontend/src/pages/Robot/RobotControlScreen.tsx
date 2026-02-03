import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';

function RobotControlScreen() {
    return (
        <GuardianAppContainer title="로봇 제어" description="원격으로 로봇을 제어합니다.">
            <section className="grid gap-4 md:grid-cols-2">
                <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                    <h2 className="text-sm font-semibold text-gray-500">상태</h2>
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                            <span>배터리</span>
                            <span className="font-semibold text-gray-900">78%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>연결</span>
                            <span className="font-semibold text-gray-900">연결됨</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>현재 위치</span>
                            <span className="font-semibold text-gray-900">거실</span>
                        </div>
                    </div>
                </article>
                <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                    <h2 className="text-sm font-semibold text-gray-500">빠른 명령</h2>
                    <div className="mt-4 grid gap-2">
                        <button
                            type="button"
                            className="min-h-[48px] rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-primary-500"
                        >
                            거실로 이동
                        </button>
                        <button
                            type="button"
                            className="min-h-[48px] rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-primary-500"
                        >
                            충전 도크로 복귀
                        </button>
                        <button
                            type="button"
                            className="min-h-[48px] rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-primary-500"
                        >
                            안내 음성 재생
                        </button>
                    </div>
                </article>
            </section>
            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                <h2 className="text-sm font-semibold text-gray-500">LCD 모드</h2>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                    <button
                        type="button"
                        className="min-h-[48px] rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-primary-500"
                    >
                        기본 화면
                    </button>
                    <button
                        type="button"
                        className="min-h-[48px] rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-primary-500"
                    >
                        복약 안내
                    </button>
                </div>
            </section>
        </GuardianAppContainer>
    );
}

export default RobotControlScreen;
