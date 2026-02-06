import { cn } from '@/shared/utils/cn';

interface BatteryIndicatorProps {
    level?: number;
    isCharging?: boolean;
}

const getBatteryTone = (level: number) => {
    if (level >= 60) {
        return 'bg-emerald-500';
    }
    if (level >= 30) {
        return 'bg-amber-500';
    }
    return 'bg-rose-500';
};

export function BatteryIndicator({ level = 0, isCharging = false }: BatteryIndicatorProps) {
    const clamped = Math.min(Math.max(level, 0), 100);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">배터리</span>
                <span className="font-semibold text-gray-900">
                    {clamped}%{isCharging ? ' (충전 중)' : ''}
                </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100">
                <div
                    className={cn('h-full rounded-full transition-all', getBatteryTone(clamped))}
                    style={{ width: `${clamped}%` }}
                />
            </div>
        </div>
    );
}
