import type { RobotStatus } from '@/shared/types/robot.types';
import { Card } from '@/shared/ui/Card';
import { BatteryIndicator } from './BatteryIndicator';
import { ConnectionStatus } from './ConnectionStatus';

interface RobotStatusCardProps {
    status?: RobotStatus | null;
    isLoading?: boolean;
}

export function RobotStatusCard({ status, isLoading = false }: RobotStatusCardProps) {
    const content = isLoading ? (
        <p className="text-sm text-gray-500">로봇 상태를 불러오는 중...</p>
    ) : (
        <div className="space-y-4">
            <BatteryIndicator level={status?.batteryLevel ?? 0} isCharging={status?.isCharging} />
            <ConnectionStatus status={status?.networkStatus} lastSyncAt={status?.lastSyncAt} />
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">현재 위치</span>
                <span className="font-semibold text-gray-900">{status?.currentLocation ?? '알 수 없음'}</span>
            </div>
        </div>
    );

    return (
        <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-500">상태</h2>
            <div className="mt-4">{content}</div>
        </Card>
    );
}
