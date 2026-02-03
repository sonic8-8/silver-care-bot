import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';

function SettingsScreen() {
    return (
        <GuardianAppContainer title="설정" description="알림 및 로봇 설정을 관리합니다.">
            <section className="space-y-4">
                <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                    <h2 className="text-sm font-semibold text-gray-500">계정</h2>
                    <div className="mt-4 space-y-3 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                            <span>이름</span>
                            <span className="font-semibold text-gray-900">홍길동</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>이메일</span>
                            <span className="font-semibold text-gray-900">care@example.com</span>
                        </div>
                    </div>
                </article>
                <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                    <h2 className="text-sm font-semibold text-gray-500">알림</h2>
                    <div className="mt-4 flex flex-col gap-3">
                        <button
                            type="button"
                            className="min-h-[48px] rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:border-primary-500"
                        >
                            긴급 알림 수신
                        </button>
                        <button
                            type="button"
                            className="min-h-[48px] rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:border-primary-500"
                        >
                            복약 알림 수신
                        </button>
                    </div>
                </article>
            </section>
        </GuardianAppContainer>
    );
}

export default SettingsScreen;
