import { describe, expect, it } from 'vitest';
import {
    parseRobotEventsRequest,
    parseRobotEventsResponse,
    parseRobotLcdModeChangeRequest,
    parseRobotLcdModeChangeResponse,
    parseRobotLcdRealtimePayload,
    parseRobotLcdStatePayload,
} from './lcd.types';

describe('lcd contracts', () => {
    it('parses lcd state payload from api contract', () => {
        const payload = parseRobotLcdStatePayload({
            mode: 'IDLE',
            emotion: 'neutral',
            message: '',
            subMessage: '',
            nextSchedule: {
                label: '병원 방문',
                time: '14:00',
            },
            lastUpdatedAt: '2026-02-08T10:00:00+09:00',
        });

        expect(payload).toMatchObject({
            mode: 'IDLE',
            emotion: 'neutral',
            nextSchedule: {
                label: '병원 방문',
                time: '14:00',
            },
        });
    });

    it('rejects lcd state when emotion enum drifts', () => {
        expect(() =>
            parseRobotLcdStatePayload({
                mode: 'IDLE',
                emotion: 'angry',
                message: '',
                subMessage: '',
            })
        ).toThrow('[contract] lcdState.emotion must be one of neutral, happy, sleep');
    });

    it('parses lcd mode change request and response', () => {
        const request = parseRobotLcdModeChangeRequest({
            mode: 'LISTENING',
            emotion: 'neutral',
            message: '듣고 있어요.',
            subMessage: '무엇을 도와드릴까요?',
        });

        const response = parseRobotLcdModeChangeResponse({
            ...request,
            updatedAt: '2026-02-08T10:00:01+09:00',
        });

        expect(request.mode).toBe('LISTENING');
        expect(response.updatedAt).toBe('2026-02-08T10:00:01+09:00');
    });

    it('rejects lcd mode change request with missing required message fields', () => {
        expect(() =>
            parseRobotLcdModeChangeRequest({
                mode: 'LISTENING',
                emotion: 'neutral',
                message: '듣고 있어요.',
            })
        ).toThrow('[contract] lcdModeChangeRequest.subMessage must be string');
    });

    it('parses robot events request including button action enum', () => {
        const payload = parseRobotEventsRequest({
            events: [
                {
                    type: 'WAKE_UP',
                    detectedAt: '2026-02-08T07:30:00+09:00',
                    location: '침실',
                    confidence: 0.88,
                },
                {
                    type: 'BUTTON',
                    detectedAt: '2026-02-08T08:00:00+09:00',
                    action: 'TAKE',
                    medicationId: 12,
                    location: '거실',
                },
            ],
        });

        expect(payload.events).toHaveLength(2);
        expect(payload.events[1]?.action).toBe('TAKE');
        expect(payload.events[1]?.medicationId).toBe(12);
    });

    it('rejects button events without action', () => {
        expect(() =>
            parseRobotEventsRequest({
                events: [
                    {
                        type: 'BUTTON',
                        detectedAt: '2026-02-08T08:00:00+09:00',
                    },
                ],
            })
        ).toThrow('[contract] robotEvent.action is required for BUTTON');
    });

    it('rejects TAKE action events without medicationId', () => {
        expect(() =>
            parseRobotEventsRequest({
                events: [
                    {
                        type: 'BUTTON',
                        detectedAt: '2026-02-08T08:00:00+09:00',
                        action: 'TAKE',
                        location: '거실',
                    },
                ],
            })
        ).toThrow('[contract] robotEvent.medicationId is required for TAKE');
    });

    it('parses robot events response', () => {
        const payload = parseRobotEventsResponse({
            accepted: 2,
            receivedAt: '2026-02-08T08:00:01+09:00',
        });

        expect(payload.accepted).toBe(2);
    });

    it('parses websocket lcd payload', () => {
        const payload = parseRobotLcdRealtimePayload({
            robotId: 1,
            mode: 'MEDICATION',
            emotion: 'happy',
            message: '약 드실 시간이에요!',
            subMessage: '아침약 2정',
            nextSchedule: {
                label: '산책',
                time: '16:00',
            },
            updatedAt: '2026-02-08T08:30:00+09:00',
        });

        expect(payload.robotId).toBe(1);
        expect(payload.nextSchedule?.label).toBe('산책');
    });
});
