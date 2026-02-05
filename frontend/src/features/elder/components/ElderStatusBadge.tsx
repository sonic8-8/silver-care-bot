import { Badge } from '@/shared/ui/Badge';
import type { ElderStatus } from '@/shared/types';

const statusLabels: Record<ElderStatus, string> = {
    SAFE: '안정',
    WARNING: '주의',
    DANGER: '위험',
};

const badgeStatusMap: Record<ElderStatus, 'safe' | 'warning' | 'danger'> = {
    SAFE: 'safe',
    WARNING: 'warning',
    DANGER: 'danger',
};

type ElderStatusBadgeProps = {
    status: ElderStatus;
};

export function ElderStatusBadge({ status }: ElderStatusBadgeProps) {
    return <Badge status={badgeStatusMap[status]}>{statusLabels[status]}</Badge>;
}
