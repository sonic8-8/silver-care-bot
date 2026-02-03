import { http, HttpResponse } from 'msw';

// 긴급 상황 Mock 핸들러
export const emergencyHandlers = [
    // POST /api/robots/:robotId/emergency - 긴급 상황 보고
    http.post('/api/robots/:robotId/emergency', async ({ request, params }) => {
        const timestamp = new Date().toISOString();
        const body = await request.json() as { type: string; location?: string; detectedAt?: string };

        return HttpResponse.json({
            success: true,
            data: {
                emergencyId: 123,
                robotId: Number(params.robotId),
                type: body.type,
                location: body.location ?? '거실',
                detectedAt: body.detectedAt ?? '2026-01-29T10:23:00+09:00',
            },
            timestamp,
        });
    }),

    // PATCH /api/emergencies/:emergencyId/resolve - 긴급 상황 해제
    http.patch('/api/emergencies/:emergencyId/resolve', async ({ request, params }) => {
        const timestamp = new Date().toISOString();
        const body = await request.json() as { resolution: string; note?: string };

        return HttpResponse.json({
            success: true,
            data: {
                emergencyId: Number(params.emergencyId),
                resolution: body.resolution,
                note: body.note ?? null,
                resolvedAt: timestamp,
            },
            timestamp,
        });
    }),
];
