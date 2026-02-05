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
    // GET /api/elders/:id/contacts - 긴급 연락처 목록
    http.get('/api/elders/:id/contacts', () => {
        const timestamp = new Date().toISOString();
        return HttpResponse.json({
            success: true,
            data: [
                {
                    id: 1,
                    name: '김자녀',
                    phone: '010-1234-5678',
                    relation: '자녀',
                    priority: 1,
                },
            ],
            timestamp,
        });
    }),
    // POST /api/elders/:id/contacts - 긴급 연락처 추가
    http.post('/api/elders/:id/contacts', async ({ request }) => {
        const timestamp = new Date().toISOString();
        const body = await request.json() as { name: string; phone: string; relation?: string; priority?: number };
        return HttpResponse.json({
            success: true,
            data: {
                id: 999,
                name: body.name,
                phone: body.phone,
                relation: body.relation ?? null,
                priority: body.priority ?? 1,
            },
            timestamp,
        });
    }),
    // PUT /api/elders/:id/contacts/:contactId - 긴급 연락처 수정
    http.put('/api/elders/:id/contacts/:contactId', async ({ request, params }) => {
        const timestamp = new Date().toISOString();
        const body = await request.json() as { name?: string; phone?: string; relation?: string; priority?: number };
        return HttpResponse.json({
            success: true,
            data: {
                id: Number(params.contactId),
                name: body.name ?? '김자녀',
                phone: body.phone ?? '010-1234-5678',
                relation: body.relation ?? '자녀',
                priority: body.priority ?? 1,
            },
            timestamp,
        });
    }),
    // DELETE /api/elders/:id/contacts/:contactId - 긴급 연락처 삭제
    http.delete('/api/elders/:id/contacts/:contactId', () => {
        const timestamp = new Date().toISOString();
        return HttpResponse.json({
            success: true,
            data: null,
            timestamp,
        });
    }),
];
