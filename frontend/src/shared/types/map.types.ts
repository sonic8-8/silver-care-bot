export const ROOM_TYPES = [
    'LIVING_ROOM',
    'KITCHEN',
    'BEDROOM',
    'BATHROOM',
    'ENTRANCE',
    'DOCK',
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];

export interface MapRoomBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface MapRoom {
    id: string;
    name: string;
    type: RoomType;
    bounds: MapRoomBounds;
}

export interface MapRobotPosition {
    x: number;
    y: number;
    roomId: string;
    heading: number;
}

export interface ElderMapPayload {
    mapId: string;
    lastUpdatedAt: string;
    rooms: MapRoom[];
    robotPosition: MapRobotPosition | null;
    mapHtml: string | null;
}

export interface RobotRoomPoint {
    id: string;
    name: string;
    x: number;
    y: number;
}

export interface RobotRoomsPayload {
    rooms: RobotRoomPoint[];
}

export interface RobotLocationUpdateRequest {
    x: number;
    y: number;
    roomId: string;
    heading: number;
    timestamp: string;
}

export interface RobotLocationUpdateAckPayload {
    received: boolean;
    serverTime: string;
}

export interface PatrolSnapshot {
    snapshotId: number;
    patrolId: string;
    imageUrl: string;
    capturedAt: string;
    roomId: string | null;
    x: number | null;
    y: number | null;
    heading: number | null;
    target: string | null;
    status: string | null;
    confidence: number | null;
}

export interface PatrolSnapshotListPayload {
    patrolId: string;
    snapshots: PatrolSnapshot[];
}

export interface RobotLocationRealtimePayload {
    robotId: number;
    elderId: number | null;
    roomId: string | null;
    x: number | null;
    y: number | null;
    heading: number | null;
    timestamp: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const readString = (value: unknown, field: string): string => {
    if (typeof value !== 'string') {
        throw new Error(`[contract] ${field} must be string`);
    }
    return value;
};

const readNumber = (value: unknown, field: string): number => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new Error(`[contract] ${field} must be number`);
    }
    return value;
};

const readBoolean = (value: unknown, field: string): boolean => {
    if (typeof value !== 'boolean') {
        throw new Error(`[contract] ${field} must be boolean`);
    }
    return value;
};

const readNullableNumber = (value: unknown, field: string): number | null => {
    if (value === undefined || value === null) {
        return null;
    }
    return readNumber(value, field);
};

const readNullableString = (value: unknown, field: string): string | null => {
    if (value === undefined || value === null) {
        return null;
    }
    return readString(value, field);
};

const readEnum = <T extends string>(value: unknown, allowed: readonly T[], field: string): T => {
    const text = readString(value, field);
    if (!allowed.includes(text as T)) {
        throw new Error(`[contract] ${field} must be one of ${allowed.join(', ')}`);
    }
    return text as T;
};

export const parseMapRoomBounds = (value: unknown): MapRoomBounds => {
    if (!isRecord(value)) {
        throw new Error('[contract] mapRoom.bounds must be object');
    }

    return {
        x: readNumber(value.x, 'mapRoom.bounds.x'),
        y: readNumber(value.y, 'mapRoom.bounds.y'),
        width: readNumber(value.width, 'mapRoom.bounds.width'),
        height: readNumber(value.height, 'mapRoom.bounds.height'),
    };
};

export const parseMapRoom = (value: unknown): MapRoom => {
    if (!isRecord(value)) {
        throw new Error('[contract] mapRoom must be object');
    }

    return {
        id: readString(value.id, 'mapRoom.id'),
        name: readString(value.name, 'mapRoom.name'),
        type: readEnum(value.type, ROOM_TYPES, 'mapRoom.type'),
        bounds: parseMapRoomBounds(value.bounds),
    };
};

export const parseMapRobotPosition = (value: unknown): MapRobotPosition => {
    if (!isRecord(value)) {
        throw new Error('[contract] map.robotPosition must be object');
    }

    return {
        x: readNumber(value.x, 'map.robotPosition.x'),
        y: readNumber(value.y, 'map.robotPosition.y'),
        roomId: readString(value.roomId, 'map.robotPosition.roomId'),
        heading: readNumber(value.heading, 'map.robotPosition.heading'),
    };
};

export const parseElderMapPayload = (value: unknown): ElderMapPayload => {
    if (!isRecord(value)) {
        throw new Error('[contract] map payload must be object');
    }
    if (!Array.isArray(value.rooms)) {
        throw new Error('[contract] map.rooms must be array');
    }

    return {
        mapId: readString(value.mapId, 'map.mapId'),
        lastUpdatedAt: readString(value.lastUpdatedAt, 'map.lastUpdatedAt'),
        rooms: value.rooms.map((room) => parseMapRoom(room)),
        robotPosition:
            value.robotPosition === undefined || value.robotPosition === null
                ? null
                : parseMapRobotPosition(value.robotPosition),
        mapHtml: readNullableString(value.mapHtml, 'map.mapHtml'),
    };
};

export const parseRobotRoomPoint = (value: unknown): RobotRoomPoint => {
    if (!isRecord(value)) {
        throw new Error('[contract] room must be object');
    }

    return {
        id: readString(value.id, 'room.id'),
        name: readString(value.name, 'room.name'),
        x: readNumber(value.x, 'room.x'),
        y: readNumber(value.y, 'room.y'),
    };
};

export const parseRobotRoomsPayload = (value: unknown): RobotRoomsPayload => {
    if (!isRecord(value)) {
        throw new Error('[contract] rooms payload must be object');
    }
    if (!Array.isArray(value.rooms)) {
        throw new Error('[contract] rooms.rooms must be array');
    }

    return {
        rooms: value.rooms.map((room) => parseRobotRoomPoint(room)),
    };
};

export const parseRobotLocationUpdateRequest = (value: unknown): RobotLocationUpdateRequest => {
    if (!isRecord(value)) {
        throw new Error('[contract] location request must be object');
    }

    return {
        x: readNumber(value.x, 'location.x'),
        y: readNumber(value.y, 'location.y'),
        roomId: readString(value.roomId, 'location.roomId'),
        heading: readNumber(value.heading, 'location.heading'),
        timestamp: readString(value.timestamp, 'location.timestamp'),
    };
};

export const parseRobotLocationUpdateAckPayload = (value: unknown): RobotLocationUpdateAckPayload => {
    if (!isRecord(value)) {
        throw new Error('[contract] location ack must be object');
    }

    return {
        received: readBoolean(value.received, 'locationAck.received'),
        serverTime: readString(value.serverTime, 'locationAck.serverTime'),
    };
};

export const parsePatrolSnapshot = (
    value: unknown,
    fallbackPatrolId?: string
): PatrolSnapshot => {
    if (!isRecord(value)) {
        throw new Error('[contract] snapshot must be object');
    }

    const snapshotId = value.snapshotId ?? value.id;
    const patrolId = value.patrolId ?? fallbackPatrolId;
    if (patrolId === undefined) {
        throw new Error('[contract] snapshot.patrolId is required');
    }

    return {
        snapshotId: readNumber(snapshotId, 'snapshot.snapshotId'),
        patrolId: readString(patrolId, 'snapshot.patrolId'),
        imageUrl: readString(value.imageUrl, 'snapshot.imageUrl'),
        capturedAt: readString(value.capturedAt, 'snapshot.capturedAt'),
        roomId: readNullableString(value.roomId, 'snapshot.roomId'),
        x: readNullableNumber(value.x, 'snapshot.x'),
        y: readNullableNumber(value.y, 'snapshot.y'),
        heading: readNullableNumber(value.heading, 'snapshot.heading'),
        target: readNullableString(value.target, 'snapshot.target'),
        status: readNullableString(value.status, 'snapshot.status'),
        confidence: readNullableNumber(value.confidence, 'snapshot.confidence'),
    };
};

export const parsePatrolSnapshotListPayload = (value: unknown): PatrolSnapshotListPayload => {
    if (!isRecord(value)) {
        throw new Error('[contract] snapshot list must be object');
    }
    if (!Array.isArray(value.snapshots)) {
        throw new Error('[contract] snapshotList.snapshots must be array');
    }

    const patrolId = readString(value.patrolId, 'snapshotList.patrolId');

    return {
        patrolId,
        snapshots: value.snapshots.map((snapshot) => parsePatrolSnapshot(snapshot, patrolId)),
    };
};

export const parseRobotLocationRealtimePayload = (value: unknown): RobotLocationRealtimePayload => {
    if (!isRecord(value)) {
        throw new Error('[contract] realtime location payload must be object');
    }

    return {
        robotId: readNumber(value.robotId, 'locationRealtime.robotId'),
        elderId:
            value.elderId === undefined || value.elderId === null
                ? null
                : readNumber(value.elderId, 'locationRealtime.elderId'),
        roomId: readNullableString(value.roomId, 'locationRealtime.roomId'),
        x: readNullableNumber(value.x, 'locationRealtime.x'),
        y: readNullableNumber(value.y, 'locationRealtime.y'),
        heading: readNullableNumber(value.heading, 'locationRealtime.heading'),
        timestamp: readNullableString(value.timestamp, 'locationRealtime.timestamp'),
    };
};
