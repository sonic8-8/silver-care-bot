import { http, HttpResponse } from 'msw';

// 노인 정보 Mock 핸들러
export const elderHandlers = [
    // GET /api/elders - 노인 목록 조회
    http.get('/api/elders', () => {
        const timestamp = new Date().toISOString();
        return HttpResponse.json({
            success: true,
            data: {
                elders: [
                    {
                        id: 1,
                        name: '김옥분',
                        age: 80,
                        status: 'SAFE',
                        lastActivity: '2026-01-29T10:23:00+09:00',
                        location: '거실',
                        robotConnected: true,
                    },
                    {
                        id: 2,
                        name: '박영자',
                        age: 82,
                        status: 'DANGER',
                        lastActivity: '2026-01-29T10:18:00+09:00',
                        location: '거실',
                        emergencyType: 'FALL_DETECTED',
                    },
                ],
                summary: {
                    total: 2,
                    safe: 1,
                    warning: 0,
                    danger: 1,
                },
            },
            timestamp,
        });
    }),

    // GET /api/elders/:id - 노인 상세 조회
    http.get('/api/elders/:id', ({ params }) => {
        const timestamp = new Date().toISOString();
        return HttpResponse.json({
            success: true,
            data: {
                id: Number(params.id),
                name: '김옥분',
                age: 80,
                status: 'SAFE',
                lastActivity: '2026-01-29T10:23:00+09:00',
                location: '거실',
                robotConnected: true,
            },
            timestamp,
        });
    }),
];
