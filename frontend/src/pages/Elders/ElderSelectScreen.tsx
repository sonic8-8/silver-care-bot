import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';

const elders = [
    { name: '김옥분', age: 80, status: '안정' },
    { name: '이정숙', age: 84, status: '주의' },
    { name: '박춘자', age: 78, status: '위험' },
];

function ElderSelectScreen() {
    return (
        <GuardianAppContainer
            title="어르신 선택"
            description="담당 어르신을 선택해 상세 대시보드로 이동합니다."
        >
            <div className="grid gap-4 md:grid-cols-2">
                {elders.map((elder) => (
                    <article
                        key={elder.name}
                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {elder.name}
                                </h2>
                                <p className="text-sm text-gray-500">{elder.age}세</p>
                            </div>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                {elder.status}
                            </span>
                        </div>
                        <button
                            type="button"
                            className="mt-4 min-h-[48px] w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-primary-500 hover:text-primary-500"
                        >
                            대시보드 보기
                        </button>
                    </article>
                ))}
            </div>
            <button
                type="button"
                className="mt-6 min-h-[48px] w-full rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
            >
                새 어르신 등록
            </button>
        </GuardianAppContainer>
    );
}

export default ElderSelectScreen;
