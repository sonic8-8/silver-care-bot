import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { UserRole } from '@/shared/types/user.types';
import { useAuth } from '@/features/auth/hooks/useAuth';

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

function SignupScreen() {
    const { signup } = useAuth();
    const [role, setRole] = useState<UserRole>('WORKER');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('이름을 입력해주세요.');
            return;
        }
        if (!email || !isValidEmail(email)) {
            setError('이메일 형식을 확인해주세요.');
            return;
        }
        if (!password || password.length < 8) {
            setError('비밀번호는 8자 이상 입력해주세요.');
            return;
        }

        try {
            setIsSubmitting(true);
            await signup({
                name,
                email,
                password,
                phone: phone.trim() ? phone : undefined,
                role,
            });
        } catch (submitError) {
            const message = submitError instanceof Error ? submitError.message : '회원가입에 실패했습니다.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        onClick={() => setRole('WORKER')}
                        className={`min-h-[48px] rounded-lg text-sm font-semibold shadow-sm ${
                            role === 'WORKER' ? 'bg-white text-gray-900' : 'text-gray-500'
                        }`}
                    >
                        복지사
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('FAMILY')}
                        className={`min-h-[48px] rounded-lg text-sm font-semibold ${
                            role === 'FAMILY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                        }`}
                    >
                        가족
                    </button>
                </div>
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium text-gray-700">
                        이름
                        <input
                            type="text"
                            placeholder="이름 입력"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        />
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700">
                        전화번호 (선택)
                        <input
                            type="tel"
                            placeholder="010-0000-0000"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        />
                    </label>
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
                        {isSubmitting ? '회원가입 중...' : '회원가입'}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500">
                    이미 계정이 있으신가요?{' '}
                    <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                        로그인
                    </Link>
                    으로 이동하세요.
                </div>
            </main>
        </div>
    );
}

export default SignupScreen;
