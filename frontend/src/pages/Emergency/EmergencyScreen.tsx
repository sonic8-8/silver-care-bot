function EmergencyScreen() {
    return (
        <div className="min-h-screen bg-danger text-white">
            <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-12 text-center">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">긴급 상황</p>
                <h1 className="mt-3 text-3xl font-semibold">즉시 확인이 필요합니다.</h1>
                <p className="mt-4 text-sm text-white/80">
                    로봇이 긴급 상황을 감지했습니다. 빠르게 조치를 진행하세요.
                </p>
                <div className="mt-10 space-y-3">
                    <button
                        type="button"
                        className="min-h-[48px] w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-danger transition-colors hover:bg-white/90"
                    >
                        119 전화하기
                    </button>
                    <button
                        type="button"
                        className="min-h-[48px] w-full rounded-lg border border-white/50 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                        상황 해제
                    </button>
                </div>
            </main>
        </div>
    );
}

export default EmergencyScreen;
