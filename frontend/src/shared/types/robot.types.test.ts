import { describe, expect, it } from 'vitest';
import {
    parseRobotCommandAckRequest,
    parseRobotCommandAckResponse,
    parseRobotSyncPayload,
} from './robot.types';

describe('robot contracts', () => {
    it('parses sync payload including schedule/medication expansions', () => {
        const payload = parseRobotSyncPayload({
            pendingCommands: [
                {
                    commandId: 'cmd-123',
                    command: 'MOVE_TO',
                    params: { location: 'KITCHEN' },
                    issuedAt: '2026-02-08T10:22:00+09:00',
                },
            ],
            scheduleReminders: [
                {
                    scheduleId: 1,
                    title: '병원 방문',
                    datetime: '2026-02-08T14:00:00+09:00',
                    remindAt: '2026-02-08T12:00:00+09:00',
                },
            ],
            medications: [
                {
                    medicationId: 2,
                    scheduledAt: '2026-02-08T19:00:00+09:00',
                    name: '저녁약',
                },
            ],
            serverTime: '2026-02-08T10:23:01+09:00',
        });

        expect(payload.pendingCommands[0]?.commandId).toBe('cmd-123');
        expect(payload.scheduleReminders[0]?.scheduleId).toBe(1);
        expect(payload.medications[0]?.medicationId).toBe(2);
        expect(payload.serverTime).toBe('2026-02-08T10:23:01+09:00');
    });

    it('accepts legacy sync shape and defaults optional lists', () => {
        const payload = parseRobotSyncPayload({
            pendingCommands: [
                {
                    commandId: 100,
                    command: 'START_PATROL',
                    issuedAt: '2026-02-08T10:22:00+09:00',
                },
            ],
        });

        expect(payload.pendingCommands[0]?.commandId).toBe('100');
        expect(payload.scheduleReminders).toHaveLength(0);
        expect(payload.medications).toHaveLength(0);
        expect(payload.serverTime).toBeNull();
    });

    it('rejects malformed sync payload', () => {
        expect(() =>
            parseRobotSyncPayload({
                pendingCommands: [],
                scheduleReminders: {},
            })
        ).toThrow('[contract] robotSync.scheduleReminders must be array');
    });

    it('parses command ack request', () => {
        const payload = parseRobotCommandAckRequest({
            status: 'COMPLETED',
            completedAt: '2026-02-08T10:25:00+09:00',
            result: {
                arrivedLocation: 'KITCHEN',
                travelTime: 30,
            },
        });

        expect(payload.status).toBe('COMPLETED');
        expect(payload.result?.arrivedLocation).toBe('KITCHEN');
    });

    it('rejects unsupported command ack status', () => {
        expect(() =>
            parseRobotCommandAckRequest({
                status: 'PENDING',
            })
        ).toThrow(
            '[contract] robotCommandAckRequest.status must be one of RECEIVED, IN_PROGRESS, COMPLETED, FAILED, CANCELLED'
        );
    });

    it('parses command ack response with serverTime fallback', () => {
        const payload = parseRobotCommandAckResponse({
            commandId: 'cmd-123',
            status: 'IN_PROGRESS',
            serverTime: '2026-02-08T10:24:00+09:00',
        });

        expect(payload.commandId).toBe('cmd-123');
        expect(payload.receivedAt).toBe('2026-02-08T10:24:00+09:00');
    });
});
