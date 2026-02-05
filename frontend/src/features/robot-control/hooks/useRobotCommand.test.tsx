import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { createQueryClientWrapper } from '@/test/utils';
import { server } from '@/mocks/server';
import { useRobotCommand } from './useRobotCommand';

describe('useRobotCommand', () => {
    it('sends a robot command', async () => {
        server.use(
            http.post('/api/robots/:robotId/commands', async ({ request, params }) => {
                const body = await request.json() as { command: string; params?: Record<string, unknown> };
                const timestamp = new Date().toISOString();

                return HttpResponse.json({
                    success: true,
                    data: {
                        commandId: `cmd-${Date.now()}`,
                        robotId: Number(params.robotId),
                        command: body.command,
                        params: body.params ?? null,
                        status: 'PENDING',
                        issuedAt: timestamp,
                    },
                    timestamp,
                });
            })
        );

        const wrapper = createQueryClientWrapper();
        const { result } = renderHook(() => useRobotCommand(1), { wrapper });

        let response: Awaited<ReturnType<typeof result.current.mutateAsync>> | undefined;
        await act(async () => {
            response = await result.current.mutateAsync({
                command: 'MOVE_TO',
                params: { location: 'LIVING_ROOM' },
            });
        });

        expect(response).toBeDefined();
        expect(response?.command).toBe('MOVE_TO');
        expect(response?.status).toBe('PENDING');
    });
});
