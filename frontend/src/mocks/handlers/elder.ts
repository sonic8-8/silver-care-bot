import { http, HttpResponse } from 'msw';

// 노인 정보 Mock 핸들러
export const elderHandlers = [
    // GET /api/elders - 노인 목록 조회
    http.get('/api/elders', () => {
        return HttpResponse.json([
            {
                id: 1,
                name: '김옥분',
                age: 80,
                status: 'safe',
                lastActivity: '10분 전',
            },
            {
                id: 2,
                name: '박영자',
                age: 82,
                status: 'warning',
                lastActivity: '5분 전',
            },
        ]);
    }),

    // GET /api/elders/:id - 노인 상세 조회
    http.get('/api/elders/:id', ({ params }) => {
        return HttpResponse.json({
            id: Number(params.id),
            name: '김옥분',
            age: 80,
            status: 'safe',
            lastActivity: '10분 전',
            medications: {
                completed: 1,
                total: 2,
            },
            wakeUpTime: '07:30',
            activityLevel: 'normal',
        });
    }),
];
