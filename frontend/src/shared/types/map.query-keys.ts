export const mapVideoQueryKeys = {
    elderMap: (elderId?: number | null) => ['map', 'elder', elderId ?? null] as const,
    robotRooms: (robotId?: number | null) => ['map', 'robot', robotId ?? null, 'rooms'] as const,
    robotLocation: (robotId?: number | null) => ['map', 'robot', robotId ?? null, 'location'] as const,
    patrolSnapshots: (patrolId?: string | null) => ['patrol', patrolId ?? null, 'snapshots'] as const,
};
