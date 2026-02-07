import { describe, expect, it } from 'vitest';
import {
    parseElderMapPayload,
    parsePatrolSnapshotListPayload,
    parseRobotLocationRealtimePayload,
    parseRobotLocationUpdateAckPayload,
    parseRobotLocationUpdateRequest,
    parseRobotRoomsPayload,
} from './map.types';

describe('map/video contracts', () => {
    it('parses elder map payload from API spec shape', () => {
        const payload = parseElderMapPayload({
            mapId: 'map-elder-1-v3',
            lastUpdatedAt: '2026-01-28T12:00:00+09:00',
            rooms: [
                {
                    id: 'room-1',
                    name: '침실',
                    type: 'BEDROOM',
                    bounds: {
                        x: 0,
                        y: 0,
                        width: 300,
                        height: 250,
                    },
                },
            ],
            robotPosition: {
                x: 450,
                y: 150,
                roomId: 'room-2',
                heading: 45,
            },
            mapHtml: '<div class="room-layout"></div>',
        });

        expect(payload.rooms[0]?.type).toBe('BEDROOM');
        expect(payload.robotPosition?.roomId).toBe('room-2');
    });

    it('rejects room type mismatch to catch contract drift early', () => {
        expect(() =>
            parseElderMapPayload({
                mapId: 'map-elder-1-v3',
                lastUpdatedAt: '2026-01-28T12:00:00+09:00',
                rooms: [
                    {
                        id: 'room-1',
                        name: '침실',
                        type: 'MASTER_ROOM',
                        bounds: {
                            x: 0,
                            y: 0,
                            width: 300,
                            height: 250,
                        },
                    },
                ],
            })
        ).toThrow('[contract] mapRoom.type must be one of LIVING_ROOM, KITCHEN, BEDROOM, BATHROOM, ENTRANCE, DOCK');
    });

    it('parses robot rooms payload', () => {
        const payload = parseRobotRoomsPayload({
            rooms: [
                {
                    id: 'LIVING_ROOM',
                    name: '거실',
                    x: 120,
                    y: 240,
                },
            ],
        });

        expect(payload.rooms[0]).toMatchObject({
            id: 'LIVING_ROOM',
            name: '거실',
        });
    });

    it('parses patrol snapshots payload and supports id alias', () => {
        const payload = parsePatrolSnapshotListPayload({
            patrolId: 'patrol-20260207-0900',
            snapshots: [
                {
                    id: 1,
                    imageUrl: 'https://cdn.example.com/snapshots/1.jpg',
                    capturedAt: '2026-02-07T09:31:00+09:00',
                    roomId: 'LIVING_ROOM',
                    x: 120,
                    y: 240,
                    heading: 45,
                    target: 'GAS_VALVE',
                    status: 'NORMAL',
                    confidence: 0.93,
                },
            ],
        });

        expect(payload.snapshots[0]?.snapshotId).toBe(1);
        expect(payload.snapshots[0]?.patrolId).toBe('patrol-20260207-0900');
    });

    it('rejects snapshot payload when imageUrl is missing', () => {
        expect(() =>
            parsePatrolSnapshotListPayload({
                patrolId: 'patrol-20260207-0900',
                snapshots: [
                    {
                        snapshotId: 1,
                        capturedAt: '2026-02-07T09:31:00+09:00',
                    },
                ],
            })
        ).toThrow('[contract] snapshot.imageUrl must be string');
    });

    it('parses location update request and response contracts', () => {
        const request = parseRobotLocationUpdateRequest({
            x: 450,
            y: 150,
            roomId: 'LIVING_ROOM',
            heading: 45,
            timestamp: '2026-01-29T10:23:00+09:00',
        });

        const ack = parseRobotLocationUpdateAckPayload({
            received: true,
            serverTime: '2026-01-29T10:23:01+09:00',
        });

        expect(request.roomId).toBe('LIVING_ROOM');
        expect(ack.received).toBe(true);
    });

    it('parses location update request without optional heading and timestamp', () => {
        const request = parseRobotLocationUpdateRequest({
            x: 450,
            y: 150,
            roomId: 'LIVING_ROOM',
        });

        expect(request).toMatchObject({
            x: 450,
            y: 150,
            roomId: 'LIVING_ROOM',
            heading: null,
            timestamp: null,
        });
    });

    it('parses realtime location payload with nullable coordinates', () => {
        const payload = parseRobotLocationRealtimePayload({
            robotId: 1,
            elderId: 2,
            roomId: 'KITCHEN',
            x: null,
            y: null,
            heading: null,
            timestamp: '2026-02-07T10:00:00+09:00',
        });

        expect(payload.robotId).toBe(1);
        expect(payload.roomId).toBe('KITCHEN');
        expect(payload.x).toBeNull();
    });
});
