import axios from 'axios';
import { api } from '@/shared/api';
import { unwrapApiResponse } from '@/shared/api/response';
import type { ApiResult } from '@/shared/types';
import type { PatrolSnapshot, PatrolSnapshotList } from '../types';

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
};

const toNullableString = (value: unknown) => {
    return typeof value === 'string' ? value : null;
};

const toNullableStringLike = (value: unknown) => {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }
    return null;
};

const toNullableFiniteNumber = (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    return null;
};

const toSnapshotList = (raw: unknown): unknown[] => {
    if (Array.isArray(raw)) {
        return raw;
    }
    if (!isRecord(raw)) {
        return [];
    }
    if (Array.isArray(raw.snapshots)) {
        return raw.snapshots;
    }
    if (Array.isArray(raw.items)) {
        return raw.items;
    }
    return [];
};

const toCapturedAtTimestamp = (value: string | null) => {
    if (!value) {
        return 0;
    }
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
};

const normalizeSnapshot = (raw: unknown, index: number): PatrolSnapshot => {
    const value = isRecord(raw) ? raw : {};
    const id = toNullableStringLike(value.id) ?? toNullableStringLike(value.snapshotId) ?? String(index + 1);
    const imageUrl = toNullableString(value.imageUrl) ?? toNullableString(value.url);
    const thumbnailUrl = toNullableString(value.thumbnailUrl) ?? imageUrl;
    const capturedAt = toNullableString(value.capturedAt) ?? toNullableString(value.createdAt);

    return {
        id,
        imageUrl,
        thumbnailUrl,
        capturedAt,
        roomId: toNullableString(value.roomId),
        roomName: toNullableString(value.roomName),
        target: toNullableString(value.target),
        status: toNullableString(value.status),
        confidence: toNullableFiniteNumber(value.confidence),
    };
};

const emptySnapshotList = (patrolId: string): PatrolSnapshotList => ({
    patrolId,
    snapshots: [],
});

export const isSnapshotDependencyFallbackError = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
        return false;
    }

    const status = error.response?.status;
    return status === 404 || status === 501;
};

export const getPatrolSnapshots = async (patrolId: string): Promise<PatrolSnapshotList> => {
    try {
        const response = await api.get<ApiResult<unknown>>(`/patrol/${patrolId}/snapshots`);
        const payload = unwrapApiResponse(response.data);
        const snapshots = toSnapshotList(payload)
            .map((item, index) => normalizeSnapshot(item, index))
            .sort((a, b) => toCapturedAtTimestamp(b.capturedAt) - toCapturedAtTimestamp(a.capturedAt));

        return {
            patrolId,
            snapshots,
        };
    } catch (error) {
        if (isSnapshotDependencyFallbackError(error)) {
            return emptySnapshotList(patrolId);
        }
        throw error;
    }
};
