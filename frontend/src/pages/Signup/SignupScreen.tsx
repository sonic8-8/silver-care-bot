function SignupScreen() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold">회원가입</h1>
                    <p className="text-sm text-gray-500">
                        역할을 선택하고 기본 정보를 입력하세요.
                    </p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-2">
                    <button
                        type="button"
                        className="min-h-[48px] rounded-lg bg-white text-sm font-semibold text-gray-900 shadow-sm"
                    >
                        복지사
                    </button>
                    <button
                        type="button"
                        className="min-h-[48px] rounded-lg text-sm font-semibold text-gray-500"
                    >
                        가족
                    </button>
                </div>
                <form className="mt-6 space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        이름
                        <input
                            type="text"
                            placeholder="이름 입력"
                            className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                        이메일
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                        비밀번호
                        <input
                            type="password"
                            placeholder="비밀번호 입력"
                            className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        />
                    </label>
                    <button
                        type="submit"
                        className="min-h-[48px] w-full rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                    >
                        회원가입
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500">
                    이미 계정이 있으신가요? 로그인으로 이동하세요.
                </div>
            </main>
        </div>
    );
}

export default SignupScreen;
