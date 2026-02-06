import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

type LoginMode = 'guardian' | 'robot';

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

function LoginScreen() {
    const { login, robotLogin } = useAuth();
    const [mode, setMode] = useState<LoginMode>('guardian');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [authCode, setAuthCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (mode === 'guardian') {
            if (!email || !isValidEmail(email)) {
                setError('이메일 형식을 확인해주세요.');
                return;
            }
            if (!password || password.length < 8) {
                setError('비밀번호는 8자 이상 입력해주세요.');
                return;
            }
        } else {
            if (!serialNumber.trim() || !authCode.trim()) {
                setError('로봇 시리얼 번호와 인증 코드를 입력해주세요.');
                return;
            }
        }

        try {
            setIsSubmitting(true);
            if (mode === 'guardian') {
                await login({ email, password });
            } else {
                await robotLogin({ serialNumber, authCode });
            }
        } catch (submitError) {
            const message = submitError instanceof Error ? submitError.message : '로그인에 실패했습니다.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold">로그인</h1>
                    <p className="text-sm text-gray-500">
                        보호자 또는 로봇 계정으로 로그인합니다.
                    </p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-2">
                    <button
                        type="button"
                        onClick={() => setMode('guardian')}
                        className={`min-h-[48px] rounded-lg text-sm font-semibold shadow-sm ${
                            mode === 'guardian'
                                ? 'bg-white text-gray-900'
                                : 'text-gray-500'
                        }`}
                    >
                        보호자
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('robot')}
                        className={`min-h-[48px] rounded-lg text-sm font-semibold ${
                            mode === 'robot'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500'
                        }`}
                    >
                        로봇
                    </button>
                </div>
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    {mode === 'guardian' ? (
                        <>
                            <label className="block text-sm font-medium text-gray-700">
                                이메일
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                />
                            </label>
                            <label className="block text-sm font-medium text-gray-700">
                                비밀번호
                                <input
                                    type="password"
                                    placeholder="비밀번호 입력"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                />
                            </label>
                        </>
                    ) : (
                        <>
                            <label className="block text-sm font-medium text-gray-700">
                                로봇 시리얼 번호
                                <input
                                    type="text"
                                    placeholder="RB-001"
                                    value={serialNumber}
                                    onChange={(event) => setSerialNumber(event.target.value)}
                                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                />
                            </label>
                            <label className="block text-sm font-medium text-gray-700">
                                인증 코드
                                <input
                                    type="password"
                                    placeholder="인증 코드 입력"
                                    value={authCode}
                                    onChange={(event) => setAuthCode(event.target.value)}
                                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                />
                            </label>
                        </>
                    )}
                    {error ? (
                        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </p>
                    ) : null}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-h-[48px] w-full rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        {isSubmitting ? '로그인 중...' : '로그인'}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500">
                    계정이 없으신가요?{' '}
                    <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
                        회원가입
                    </Link>
                    으로 이동하세요.
                </div>
            </main>
        </div>
    );
}

export default LoginScreen;
