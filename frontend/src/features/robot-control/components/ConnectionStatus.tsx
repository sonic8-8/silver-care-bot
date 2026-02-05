import type { RobotConnectionStatus } from '@/shared/types/robot.types';
import { cn } from '@/shared/utils/cn';

interface ConnectionStatusProps {
    status?: RobotConnectionStatus;
    lastSyncAt?: string;
}

export function ConnectionStatus({ status, lastSyncAt }: ConnectionStatusProps) {
    const isConnected = status === 'CONNECTED';

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">연결 상태</span>
                <span className="flex items-center gap-2 font-semibold text-gray-900">
                    <span
                        className={cn(
                            'h-2 w-2 rounded-full',
                            isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                        )}
                    />
                    {isConnected ? '연결됨' : '오프라인'}
                </span>
            </div>
            {lastSyncAt && (
                <p className="text-xs text-gray-400">마지막 동기화 {lastSyncAt}</p>
            )}
        </div>
    );
}
