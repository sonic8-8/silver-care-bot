import { http, HttpResponse } from 'msw';

const defaultMapPayload = {
    mapId: 'map-elder-1-v3',
    lastUpdatedAt: '2026-02-07T09:40:00+09:00',
    rooms: [
        {
            id: 'room-1',
            name: '침실',
            type: 'BEDROOM',
            bounds: { x: 0, y: 0, width: 240, height: 220 },
        },
        {
            id: 'room-2',
            name: '거실',
            type: 'LIVING_ROOM',
            bounds: { x: 240, y: 0, width: 320, height: 260 },
        },
        {
            id: 'room-3',
            name: '주방',
            type: 'KITCHEN',
            bounds: { x: 240, y: 260, width: 200, height: 160 },
        },
        {
            id: 'room-4',
            name: '화장실',
            type: 'BATHROOM',
            bounds: { x: 0, y: 220, width: 140, height: 120 },
        },
    ],
    robotPosition: {
        x: 360,
        y: 120,
        roomId: 'room-2',
        heading: 32,
        timestamp: '2026-02-07T09:40:10+09:00',
    },
    mapHtml: "<div class='room-layout'>...</div>",
};

const snapshotByPatrolId: Record<string, Array<Record<string, unknown>>> = {
    'patrol-20260207-0930': [
        {
            id: 'snap-301',
            imageUrl: 'https://picsum.photos/seed/patrol301/1280/720',
            thumbnailUrl: 'https://picsum.photos/seed/patrol301/512/288',
            capturedAt: '2026-02-07T09:31:00+09:00',
            roomId: 'room-2',
            roomName: '거실',
            target: 'GAS_VALVE',
            status: 'NORMAL',
            confidence: 0.96,
        },
        {
            id: 'snap-302',
            imageUrl: 'https://picsum.photos/seed/patrol302/1280/720',
            thumbnailUrl: 'https://picsum.photos/seed/patrol302/512/288',
            capturedAt: '2026-02-07T09:33:00+09:00',
            roomId: 'room-1',
            roomName: '침실',
            target: 'WINDOW',
            status: 'LOCKED',
            confidence: 0.94,
        },
    ],
};

export const mapHandlers = [
    http.get('/api/elders/:elderId/map', ({ params }) => {
        return HttpResponse.json({
            success: true,
            data: {
                ...defaultMapPayload,
                mapId: `map-elder-${Number(params.elderId)}-v3`,
            },
            timestamp: new Date().toISOString(),
        });
    }),

    http.get('/api/patrol/:patrolId/snapshots', ({ params }) => {
        const patrolId = String(params.patrolId);
        const snapshots = snapshotByPatrolId[patrolId] ?? [];

        return HttpResponse.json({
            success: true,
            data: {
                patrolId,
                snapshots,
            },
            timestamp: new Date().toISOString(),
        });
    }),
];
