import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { CommandButtons } from '@/features/robot-control/components/CommandButtons';
import { RobotStatusCard } from '@/features/robot-control/components/RobotStatusCard';
import { RoomSelector, type RoomOption } from '@/features/robot-control/components/RoomSelector';
import { TtsInput } from '@/features/robot-control/components/TtsInput';
import { useRobotCommand } from '@/features/robot-control/hooks/useRobotCommand';
import { useRobotStatus } from '@/features/robot-control/hooks/useRobotStatus';
import type { RobotCommandType } from '@/features/robot-control/api/robotApi';
import { robotApi } from '@/features/robot-control/api/robotApi';

const ROOM_OPTIONS: RoomOption[] = [
    { value: 'LIVING_ROOM', label: '거실' },
    { value: 'KITCHEN', label: '주방' },
    { value: 'BEDROOM', label: '침실' },
    { value: 'BATHROOM', label: '화장실' },
    { value: 'ENTRANCE', label: '현관' },
    { value: 'DOCK', label: '충전 도크' },
];

const LCD_MODE_OPTIONS = [
    { value: 'IDLE', label: '기본 화면' },
    { value: 'MEDICATION', label: '복약 안내' },
    { value: 'SCHEDULE', label: '일정 안내' },
    { value: 'GREETING', label: '인사 모드' },
];

function RobotControlScreen() {
    const { elderId } = useParams();
    const resolvedElderId = useMemo(() => {
        const parsed = Number(elderId);
        return Number.isNaN(parsed) ? undefined : parsed;
    }, [elderId]);

    const { data: resolvedRobotId, isLoading: isRobotIdLoading } = useQuery({
        queryKey: ['elder', 'robot', resolvedElderId],
        queryFn: () => robotApi.getRobotIdByElder(resolvedElderId as number),
        enabled: typeof resolvedElderId === 'number' && !Number.isNaN(resolvedElderId),
    });

    const robotId = resolvedRobotId ?? undefined;

    const { data: status, isLoading } = useRobotStatus(robotId);
    const commandMutation = useRobotCommand(robotId);

    const [selectedRoom, setSelectedRoom] = useState(ROOM_OPTIONS[0].value);
    const [ttsMessage, setTtsMessage] = useState('');
    const hasRobot = typeof robotId === 'number';
    const disableCommands = commandMutation.isPending || !hasRobot;
    const statusLoading = isLoading || isRobotIdLoading;

    const sendCommand = (command: RobotCommandType, params?: Record<string, unknown>) => {
        commandMutation.mutate({ command, params });
    };

    const handleMove = () => {
        sendCommand('MOVE_TO', { location: selectedRoom });
    };

    const handleReturnDock = () => {
        sendCommand('RETURN_TO_DOCK');
    };

    const handlePatrol = () => {
        sendCommand('START_PATROL');
    };

    const handleTtsSend = () => {
        if (!ttsMessage.trim()) {
            return;
        }
        sendCommand('SPEAK', { message: ttsMessage.trim() });
        setTtsMessage('');
    };

    const handleLcdMode = (mode: string) => {
        sendCommand('CHANGE_LCD_MODE', { mode });
    };

    return (
        <GuardianAppContainer title="로봇 제어" description="원격으로 로봇을 제어합니다.">
            <section className="grid gap-4 md:grid-cols-2">
                {!hasRobot && !statusLoading ? (
                    <Card className="p-4 text-center text-gray-500">
                        <p>등록된 로봇이 없습니다</p>
                        <p className="mt-2 text-sm">어르신에게 로봇을 먼저 등록해주세요</p>
                    </Card>
                ) : (
                    <RobotStatusCard status={status} isLoading={statusLoading} />
                )}
                <Card className="p-5">
                    <h2 className="text-sm font-semibold text-gray-500">이동 명령</h2>
                    <div className="mt-4 space-y-4">
                        {typeof robotId !== 'number' && !statusLoading && (
                            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                로봇 정보가 없어 명령을 보낼 수 없습니다.
                            </p>
                        )}
                        <RoomSelector
                            value={selectedRoom}
                            options={ROOM_OPTIONS}
                            onChange={setSelectedRoom}
                        />
                        <CommandButtons
                            onMove={handleMove}
                            onReturnDock={handleReturnDock}
                            onStartPatrol={handlePatrol}
                            isLoading={disableCommands}
                        />
                    </div>
                </Card>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-2">
                <Card className="p-5">
                    <h2 className="text-sm font-semibold text-gray-500">음성 안내</h2>
                    <div className="mt-4">
                        <TtsInput
                            value={ttsMessage}
                            onChange={setTtsMessage}
                            onSend={handleTtsSend}
                            isLoading={disableCommands}
                        />
                    </div>
                </Card>

                <Card className="p-5">
                    <h2 className="text-sm font-semibold text-gray-500">LCD 모드</h2>
                    <p className="mt-2 text-xs text-gray-400">
                        현재 모드: {status?.lcdMode ?? 'IDLE'}
                    </p>
                    <div className="mt-4 grid gap-2">
                        {LCD_MODE_OPTIONS.map((option) => (
                            <Button
                                key={option.value}
                                variant="white"
                                fullWidth
                                onClick={() => handleLcdMode(option.value)}
                                disabled={disableCommands}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </Card>
            </section>
        </GuardianAppContainer>
    );
}

export default RobotControlScreen;
