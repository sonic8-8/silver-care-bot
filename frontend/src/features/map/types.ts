export type MapRoomType =
    | 'BEDROOM'
    | 'LIVING_ROOM'
    | 'BATHROOM'
    | 'KITCHEN'
    | 'ENTRANCE'
    | 'OTHER';

export type MapRoomBounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type MapRoom = {
    id: string;
    name: string;
    type: MapRoomType;
    bounds: MapRoomBounds;
};

export type RobotMapPosition = {
    x: number;
    y: number;
    roomId: string | null;
    heading: number | null;
    timestamp: string | null;
};

export type ElderMapData = {
    mapId: string | null;
    lastUpdatedAt: string | null;
    rooms: MapRoom[];
    robotPosition: RobotMapPosition | null;
    mapHtml: string | null;
};

export type PatrolSnapshot = {
    id: string;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    capturedAt: string | null;
    roomId: string | null;
    roomName: string | null;
    target: string | null;
    status: string | null;
    confidence: number | null;
};

export type PatrolSnapshotList = {
    patrolId: string;
    snapshots: PatrolSnapshot[];
};

export type RobotLocationRealtimePayload = {
    robotId: number;
    elderId: number | null;
    x: number;
    y: number;
    roomId: string | null;
    heading: number | null;
    timestamp: string | null;
};
