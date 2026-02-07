import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/shared/api';
import { getElderMap, isMapDependencyFallbackError } from './mapApi';

vi.mock('@/shared/api', () => ({
    api: {
        get: vi.fn(),
    },
}));

describe('mapApi', () => {
    const getMock = vi.mocked(api.get);

    beforeEach(() => {
        getMock.mockReset();
    });

    it('normalizes map payload for canvas rendering', async () => {
        getMock.mockResolvedValue({
            data: {
                success: true,
                data: {
                    mapId: 'map-elder-1-v1',
                    rooms: [
                        {
                            id: 'room-1',
                            name: '침실',
                            type: 'BEDROOM',
                            bounds: { x: 0, y: 0, width: 240, height: 200 },
                        },
                        {
                            id: 'room-2',
                            type: 'UNKNOWN_ROOM',
                            bounds: { x: 250, y: 0, width: 280, height: 220 },
                        },
                    ],
                    robotPosition: {
                        x: 320,
                        y: 140,
                        roomId: 'room-2',
                        heading: 45,
                    },
                },
                timestamp: '2026-02-07T10:00:00+09:00',
            },
        });

        const result = await getElderMap(1);

        expect(result.mapId).toBe('map-elder-1-v1');
        expect(result.rooms).toHaveLength(2);
        expect(result.rooms[0]?.name).toBe('침실');
        expect(result.rooms[1]?.name).toBe('구역 2');
        expect(result.rooms[1]?.type).toBe('OTHER');
        expect(result.robotPosition?.x).toBe(320);
        expect(result.robotPosition?.heading).toBe(45);
    });

    it('returns empty map when dependency endpoint is not ready', async () => {
        getMock.mockRejectedValue({
            isAxiosError: true,
            response: { status: 404 },
        });

        const result = await getElderMap(1);

        expect(result).toEqual({
            mapId: null,
            lastUpdatedAt: null,
            rooms: [],
            robotPosition: null,
            mapHtml: null,
        });
    });

    it('allows fallback only for 404 and 501', () => {
        expect(isMapDependencyFallbackError({ isAxiosError: true, response: { status: 404 } })).toBe(true);
        expect(isMapDependencyFallbackError({ isAxiosError: true, response: { status: 501 } })).toBe(true);
        expect(isMapDependencyFallbackError({ isAxiosError: true, response: { status: 500 } })).toBe(false);
        expect(isMapDependencyFallbackError(new Error('network'))).toBe(false);
    });
});
