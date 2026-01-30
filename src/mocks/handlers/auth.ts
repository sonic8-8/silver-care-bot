import { http, HttpResponse } from 'msw';

// 인증 Mock 핸들러
export const authHandlers = [
    // POST /api/auth/login - 로그인
    http.post('/api/auth/login', async ({ request }) => {
        const body = await request.json() as { email: string; password: string };

        if (body.email === 'test@example.com' && body.password === 'password123') {
            return HttpResponse.json({
                token: 'mock-jwt-token',
                user: {
                    id: 1,
                    name: '김복지',
                    email: 'test@example.com',
                    role: 'caregiver',
                },
            });
        }

        return HttpResponse.json(
            { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
            { status: 401 }
        );
    }),

    // POST /api/auth/signup - 회원가입
    http.post('/api/auth/signup', async ({ request }) => {
        const body = await request.json() as {
            name: string;
            email: string;
            password: string;
            phone?: string;
        };

        return HttpResponse.json({
            id: 1,
            name: body.name,
            email: body.email,
        }, { status: 201 });
    }),

    // POST /api/auth/logout - 로그아웃
    http.post('/api/auth/logout', () => {
        return HttpResponse.json({ message: '로그아웃 성공' });
    }),
];
