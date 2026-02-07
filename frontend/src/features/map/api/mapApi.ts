import axios from 'axios';
import { api } from '@/shared/api';
import { unwrapApiResponse } from '@/shared/api/response';
import type { ApiResult } from '@/shared/types';
import type { ElderMapData, MapRoom, MapRoomBounds, MapRoomType, RobotMapPosition } from '../types';

const mapRoomTypes: MapRoomType[] = [
    'BEDROOM',
    'LIVING_ROOM',
    'BATHROOM',
    'KITCHEN',
    'ENTRANCE',
    'OTHER',
];

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
};

const toNullableString = (value: unknown) => {
    return typeof value === 'string' ? value : null;
};

const toFiniteNumber = (value: unknown, fallback = 0) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    return fallback;
};

const toNullableFiniteNumber = (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    return null;
};

const ensureRoomType = (value: unknown): MapRoomType => {
    if (typeof value !== 'string') {
        return 'OTHER';
    }
    return mapRoomTypes.includes(value as MapRoomType) ? (value as MapRoomType) : 'OTHER';
};

const normalizeBounds = (raw: unknown): MapRoomBounds => {
    const value = isRecord(raw) ? raw : {};

    return {
        x: toFiniteNumber(value.x, 0),
        y: toFiniteNumber(value.y, 0),
        width: Math.max(0, toFiniteNumber(value.width, 0)),
        height: Math.max(0, toFiniteNumber(value.height, 0)),
    };
};

const normalizeRoom = (raw: unknown, index: number): MapRoom => {
    const value = isRecord(raw) ? raw : {};
    const roomId = toNullableString(value.id);
    const roomName = toNullableString(value.name);

    return {
        id: roomId ?? `room-${index + 1}`,
        name: roomName ?? `구역 ${index + 1}`,
        type: ensureRoomType(value.type),
        bounds: normalizeBounds(value.bounds),
    };
};

const normalizeRobotPosition = (raw: unknown): RobotMapPosition | null => {
    if (!isRecord(raw)) {
        return null;
    }

    return {
        x: toFiniteNumber(raw.x, 0),
        y: toFiniteNumber(raw.y, 0),
        roomId: toNullableString(raw.roomId),
        heading: toNullableFiniteNumber(raw.heading),
        timestamp: toNullableString(raw.timestamp),
    };
};

const emptyMapData: ElderMapData = {
    mapId: null,
    lastUpdatedAt: null,
    rooms: [],
    robotPosition: null,
    mapHtml: null,
};

const normalizeMapData = (raw: unknown): ElderMapData => {
    if (!isRecord(raw)) {
        return emptyMapData;
    }

    const rooms = Array.isArray(raw.rooms)
        ? raw.rooms.map((item, index) => normalizeRoom(item, index))
        : [];

    return {
        mapId: toNullableString(raw.mapId),
        lastUpdatedAt: toNullableString(raw.lastUpdatedAt),
        rooms,
        robotPosition: normalizeRobotPosition(raw.robotPosition),
        mapHtml: toNullableString(raw.mapHtml),
    };
};

export const isMapDependencyFallbackError = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
        return false;
    }

    const status = error.response?.status;
    return status === 404 || status === 501;
};

export const getElderMap = async (elderId: number): Promise<ElderMapData> => {
    try {
        const response = await api.get<ApiResult<unknown>>(`/elders/${elderId}/map`);
        const payload = unwrapApiResponse(response.data);
        return normalizeMapData(payload);
    } catch (error) {
        if (isMapDependencyFallbackError(error)) {
            return emptyMapData;
        }
        throw error;
    }
};
