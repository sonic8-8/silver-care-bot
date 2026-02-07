import { describe, expect, it } from 'vitest';
import {
    parseActivityListPayload,
    parsePatrolLatestPayload,
    parseWeeklyReportPayload,
} from './history.types';

describe('history contracts', () => {
    it('parses activity list payload with backend detectedAt field', () => {
        const payload = parseActivityListPayload({
            date: '2026-02-07',
            activities: [
                {
                    id: 1,
                    elderId: 3,
                    robotId: 8,
                    type: 'WAKE_UP',
                    title: '기상 감지',
                    description: '침실 움직임',
                    location: '침실',
                    detectedAt: '2026-02-07T07:20:00+09:00',
                    createdAt: '2026-02-07T07:20:05+09:00',
                },
            ],
        });

        expect(payload.activities[0]).toMatchObject({
            id: 1,
            type: 'WAKE_UP',
            title: '기상 감지',
            detectedAt: '2026-02-07T07:20:00+09:00',
        });
    });

    it('accepts null activity title in backend payload', () => {
        const payload = parseActivityListPayload({
            date: '2026-02-07',
            activities: [
                {
                    id: 2,
                    elderId: 3,
                    robotId: 8,
                    type: 'CONVERSATION',
                    title: null,
                    description: '일상 대화',
                    location: '거실',
                    detectedAt: '2026-02-07T10:00:00+09:00',
                    createdAt: '2026-02-07T10:00:01+09:00',
                },
            ],
        });

        expect(payload.activities[0]?.title).toBeNull();
    });

    it('parses activity list payload with legacy timestamp field', () => {
        const payload = parseActivityListPayload({
            date: '2026-02-07',
            activities: [
                {
                    id: 10,
                    type: 'PATROL_COMPLETE',
                    title: '순찰 완료',
                    description: '가스밸브 확인',
                    timestamp: '2026-02-07T09:31:00+09:00',
                },
            ],
        });

        expect(payload.activities[0]?.detectedAt).toBe('2026-02-07T09:31:00+09:00');
    });

    it('parses weekly report payload with fixed backend contract', () => {
        const payload = parseWeeklyReportPayload({
            weekStartDate: '2026-02-02',
            weekEndDate: '2026-02-08',
            medicationRate: 88.5,
            activityCount: 19,
            conversationKeywords: ['수분', '산책'],
            recommendations: ['아침 복약 점검을 유지하세요.'],
            generatedAt: '2026-02-09T00:00:00+09:00',
            source: 'CALCULATED',
        });

        expect(payload.source).toBe('CALCULATED');
        expect(payload.activityCount).toBe(19);
    });

    it('rejects outdated weekly report shape to catch contract mismatch', () => {
        expect(() =>
            parseWeeklyReportPayload({
                period: { start: '2026-02-02', end: '2026-02-08' },
                summary: 'legacy',
                metrics: { medicationRate: { value: 90 } },
            })
        ).toThrow('[contract] weeklyReport.weekStartDate must be string');
    });

    it('parses patrol latest payload and validates status enum', () => {
        const payload = parsePatrolLatestPayload({
            lastPatrolAt: '2026-02-07T09:35:00+09:00',
            items: [
                {
                    id: 1,
                    target: 'GAS_VALVE',
                    label: '가스밸브',
                    status: 'NORMAL',
                    checkedAt: '2026-02-07T09:31:00+09:00',
                    imageUrl: null,
                },
                {
                    id: 2,
                    target: 'APPLIANCE',
                    label: '전열기구',
                    status: 'OFF',
                    checkedAt: '2026-02-07T09:32:00+09:00',
                    imageUrl: null,
                },
                {
                    id: 3,
                    target: 'MULTI_TAP',
                    label: '멀티탭',
                    status: 'ON',
                    checkedAt: '2026-02-07T09:33:00+09:00',
                    imageUrl: null,
                },
            ],
        });

        expect(payload.items[0]?.status).toBe('NORMAL');
        expect(payload.items[1]?.target).toBe('MULTI_TAP');
        expect(payload.items[2]?.target).toBe('MULTI_TAP');
        expect(() =>
            parsePatrolLatestPayload({
                lastPatrolAt: '2026-02-07T09:35:00+09:00',
                items: [
                    {
                        id: 1,
                        target: 'GAS_VALVE',
                        label: '가스밸브',
                        status: 'SAFE',
                        checkedAt: '2026-02-07T09:31:00+09:00',
                    },
                ],
            })
        ).toThrow('[contract] patrolItem.status must be one of NORMAL, LOCKED, UNLOCKED, ON, OFF, NEEDS_CHECK');
    });

    it('accepts null lastPatrolAt for empty patrol history', () => {
        const payload = parsePatrolLatestPayload({
            lastPatrolAt: null,
            items: [],
        });

        expect(payload.lastPatrolAt).toBeNull();
        expect(payload.items).toHaveLength(0);
    });
});
