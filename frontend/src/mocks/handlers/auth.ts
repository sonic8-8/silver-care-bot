import { http, HttpResponse } from 'msw';

// 인증 Mock 핸들러
export const authHandlers = [
    // POST /api/auth/login - 로그인
    http.post('/api/auth/login', async ({ request }) => {
        const timestamp = new Date().toISOString();
        const body = await request.json() as { email: string; password: string };

        if (body.email === 'test@example.com' && body.password === 'password123') {
            return HttpResponse.json({
                success: true,
                data: {
                    accessToken: 'mock-access-token',
                    refreshToken: 'mock-refresh-token',
                    expiresIn: 3600,
                    user: {
                        id: 1,
                        name: '김복지',
                        email: 'test@example.com',
                        role: 'WORKER',
                        phone: '010-1234-5678',
                    },
                },
                timestamp,
            });
        }

        return HttpResponse.json(
            {
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
                },
                timestamp,
            },
            { status: 401 }
        );
    }),

    // POST /api/auth/signup - 회원가입
    http.post('/api/auth/signup', async ({ request }) => {
        const timestamp = new Date().toISOString();
        const body = await request.json() as {
            name: string;
            email: string;
            password: string;
            phone?: string;
            role?: 'WORKER' | 'FAMILY';
        };

        return HttpResponse.json({
            success: true,
            data: {
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                expiresIn: 3600,
                user: {
                    id: 1,
                    name: body.name,
                    email: body.email,
                    role: body.role ?? 'WORKER',
                    phone: body.phone,
                },
            },
            timestamp,
        }, { status: 201 });
    }),

    // POST /api/auth/logout - 로그아웃
    http.post('/api/auth/logout', () => {
        return HttpResponse.json({
            success: true,
            data: null,
            timestamp: new Date().toISOString(),
        });
    }),

    // POST /api/auth/refresh - 토큰 갱신
    http.post('/api/auth/refresh', async ({ request }) => {
        const timestamp = new Date().toISOString();
        const body = await request.json()
            .then((value) => value as { refreshToken?: string })
            .catch(() => ({} as { refreshToken?: string }));

        if (body.refreshToken && body.refreshToken !== 'mock-refresh-token') {
            return HttpResponse.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Refresh token is invalid',
                    },
                    timestamp,
                },
                { status: 401 }
            );
        }

        return HttpResponse.json({
            success: true,
            data: {
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                expiresIn: 3600,
            },
            timestamp,
        });
    }),

    // POST /api/auth/robot/login - 로봇 인증
    http.post('/api/auth/robot/login', async ({ request }) => {
        const timestamp = new Date().toISOString();
        const body = await request.json() as { serialNumber: string; authCode: string };

        if (body.authCode !== '9999') {
            return HttpResponse.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Invalid auth code',
                    },
                    timestamp,
                },
                { status: 401 }
            );
        }

        return HttpResponse.json({
            success: true,
            data: {
                accessToken: 'mock-access-token',
                robot: {
                    id: 1,
                    serialNumber: body.serialNumber,
                    elderId: 2,
                    elderName: '김옥분',
                },
            },
            timestamp,
        });
    }),
];
