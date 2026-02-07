import { http, HttpResponse } from 'msw';
import {
    parseElderMapPayload,
    parsePatrolSnapshotListPayload,
    parseRobotLocationUpdateAckPayload,
    parseRobotLocationUpdateRequest,
    parseRobotRoomPoint,
    parseRobotRoomsPayload,
    type MapRobotPosition,
    type RobotRoomPoint,
    type RoomType,
    ROOM_TYPES,
} from '@/shared/types';

const defaultRooms: RobotRoomPoint[] = [
    {
        id: 'BEDROOM',
        name: '침실',
        x: 120,
        y: 120,
    },
    {
        id: 'LIVING_ROOM',
        name: '거실',
        x: 360,
        y: 140,
    },
    {
        id: 'BATHROOM',
        name: '화장실',
        x: 120,
        y: 320,
    },
    {
        id: 'KITCHEN',
        name: '주방',
        x: 360,
        y: 320,
    },
];

const robotRoomsById = new Map<number, RobotRoomPoint[]>([
    [
        1,
        defaultRooms.map((room) => ({ ...room })),
    ],
]);

const robotPositionById = new Map<number, MapRobotPosition>([
    [
        1,
        {
            x: 360,
            y: 140,
            roomId: 'LIVING_ROOM',
            heading: 45,
        },
    ],
]);

const snapshotStore: Record<string, Array<Record<string, unknown>>> = {
    'patrol-20260207-0900': [
        {
            snapshotId: 1,
            imageUrl: 'https://cdn.example.com/patrol/patrol-20260207-0900/1.jpg',
            capturedAt: '2026-02-07T09:31:00+09:00',
            roomId: 'LIVING_ROOM',
            x: 340,
            y: 160,
            heading: 40,
            target: 'GAS_VALVE',
            status: 'NORMAL',
            confidence: 0.94,
        },
        {
            snapshotId: 2,
            imageUrl: 'https://cdn.example.com/patrol/patrol-20260207-0900/2.jpg',
            capturedAt: '2026-02-07T09:33:00+09:00',
            roomId: 'ENTRANCE',
            x: 520,
            y: 110,
            heading: 96,
            target: 'DOOR',
            status: 'LOCKED',
            confidence: 0.98,
        },
    ],
};

const roomTypeByRoomId = (roomId: string): RoomType => {
    if (ROOM_TYPES.includes(roomId as RoomType)) {
        return roomId as RoomType;
    }
    if (roomId.includes('KITCHEN')) {
        return 'KITCHEN';
    }
    if (roomId.includes('BED')) {
        return 'BEDROOM';
    }
    if (roomId.includes('BATH')) {
        return 'BATHROOM';
    }
    if (roomId.includes('DOCK')) {
        return 'DOCK';
    }
    if (roomId.includes('ENTR')) {
        return 'ENTRANCE';
    }
    return 'LIVING_ROOM';
};

const getRoomsByRobotId = (robotId: number) => {
    const existing = robotRoomsById.get(robotId);
    if (existing) {
        return existing;
    }

    const initial = defaultRooms.map((room) => ({ ...room }));
    robotRoomsById.set(robotId, initial);
    return initial;
};

const getRobotPosition = (robotId: number) => {
    const existing = robotPositionById.get(robotId);
    if (existing) {
        return existing;
    }

    const initial: MapRobotPosition = {
        x: 360,
        y: 140,
        roomId: 'LIVING_ROOM',
        heading: 0,
    };
    robotPositionById.set(robotId, initial);
    return initial;
};

const sanitizeRoomId = (name: string) => {
    return name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
};

export const mapHandlers = [
    http.get('/api/elders/:elderId/map', ({ params }) => {
        const elderId = Number(params.elderId);
        const robotId = Number.isNaN(elderId) ? 1 : elderId;
        const rooms = getRoomsByRobotId(robotId);
        const robotPosition = getRobotPosition(robotId);

        const payload = parseElderMapPayload({
            mapId: `map-elder-${Number.isNaN(elderId) ? 1 : elderId}-v1`,
            lastUpdatedAt: new Date().toISOString(),
            rooms: rooms.map((room) => ({
                id: room.id,
                name: room.name,
                type: roomTypeByRoomId(room.id),
                bounds: {
                    x: Math.max(0, room.x - 80),
                    y: Math.max(0, room.y - 60),
                    width: 180,
                    height: 140,
                },
            })),
            robotPosition,
            mapHtml: "<div class='room-layout'>mocked map</div>",
        });

        return HttpResponse.json({
            success: true,
            data: payload,
            timestamp: new Date().toISOString(),
        });
    }),

    http.get('/api/robots/:robotId/rooms', ({ params }) => {
        const robotId = Number(params.robotId);
        const payload = parseRobotRoomsPayload({
            rooms: getRoomsByRobotId(Number.isNaN(robotId) ? 1 : robotId),
        });

        return HttpResponse.json({
            success: true,
            data: payload,
            timestamp: new Date().toISOString(),
        });
    }),

    http.post('/api/robots/:robotId/rooms', async ({ request, params }) => {
        const robotId = Number(params.robotId);
        const body = await request.json() as Record<string, unknown>;
        const resolvedRobotId = Number.isNaN(robotId) ? 1 : robotId;
        const rooms = getRoomsByRobotId(resolvedRobotId);
        const robotPosition = getRobotPosition(resolvedRobotId);

        const useCurrentLocation = body.useCurrentLocation === true;
        const rawName = typeof body.name === 'string' ? body.name.trim() : '';
        const name = rawName.length > 0 ? rawName : `공간 ${rooms.length + 1}`;
        const rawId = typeof body.id === 'string' ? body.id.trim() : '';
        const id = rawId.length > 0 ? rawId : sanitizeRoomId(name) || `ROOM_${rooms.length + 1}`;
        const x = typeof body.x === 'number' ? body.x : useCurrentLocation ? robotPosition.x : 0;
        const y = typeof body.y === 'number' ? body.y : useCurrentLocation ? robotPosition.y : 0;

        const room = parseRobotRoomPoint({
            id,
            name,
            x,
            y,
        });

        const existingIndex = rooms.findIndex((entry) => entry.id === room.id);
        if (existingIndex >= 0) {
            rooms[existingIndex] = room;
        } else {
            rooms.push(room);
        }

        return HttpResponse.json(
            {
                success: true,
                data: {
                    ...room,
                    createdAt: new Date().toISOString(),
                },
                timestamp: new Date().toISOString(),
            },
            {
                status: 201,
            }
        );
    }),

    http.put('/api/robots/:robotId/rooms/:roomId', async ({ request, params }) => {
        const robotId = Number(params.robotId);
        const roomId = String(params.roomId ?? '');
        const body = await request.json() as Record<string, unknown>;
        const rooms = getRoomsByRobotId(Number.isNaN(robotId) ? 1 : robotId);
        const index = rooms.findIndex((entry) => entry.id === roomId);

        if (index < 0) {
            return HttpResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Room not found',
                    },
                    timestamp: new Date().toISOString(),
                },
                {
                    status: 404,
                }
            );
        }

        const current = rooms[index];
        const next = parseRobotRoomPoint({
            id: current.id,
            name: typeof body.name === 'string' ? body.name : current.name,
            x: typeof body.x === 'number' ? body.x : current.x,
            y: typeof body.y === 'number' ? body.y : current.y,
        });

        rooms[index] = next;

        return HttpResponse.json({
            success: true,
            data: {
                ...next,
                updatedAt: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
        });
    }),

    http.delete('/api/robots/:robotId/rooms/:roomId', ({ params }) => {
        const robotId = Number(params.robotId);
        const roomId = String(params.roomId ?? '');
        const rooms = getRoomsByRobotId(Number.isNaN(robotId) ? 1 : robotId);
        const index = rooms.findIndex((entry) => entry.id === roomId);

        if (index < 0) {
            return HttpResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Room not found',
                    },
                    timestamp: new Date().toISOString(),
                },
                {
                    status: 404,
                }
            );
        }

        rooms.splice(index, 1);
        return new HttpResponse(null, {
            status: 204,
        });
    }),

    http.put('/api/robots/:robotId/location', async ({ request, params }) => {
        const robotId = Number(params.robotId);
        const location = parseRobotLocationUpdateRequest(await request.json());
        const resolvedRobotId = Number.isNaN(robotId) ? 1 : robotId;
        const previous = getRobotPosition(resolvedRobotId);

        robotPositionById.set(resolvedRobotId, {
            x: location.x,
            y: location.y,
            roomId: location.roomId,
            heading: location.heading ?? previous.heading,
        });

        const payload = parseRobotLocationUpdateAckPayload({
            received: true,
            serverTime: new Date().toISOString(),
        });

        return HttpResponse.json({
            success: true,
            data: payload,
            timestamp: new Date().toISOString(),
        });
    }),

    http.get('/api/patrol/:patrolId/snapshots', ({ params }) => {
        const patrolId = String(params.patrolId ?? '');
        const snapshots = snapshotStore[patrolId] ?? [];
        const payload = parsePatrolSnapshotListPayload({
            patrolId,
            snapshots,
        });

        return HttpResponse.json({
            success: true,
            data: payload,
            timestamp: new Date().toISOString(),
        });
    }),
];
