import type { ElderSummary } from '@/shared/types';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ElderStatusBadge } from './ElderStatusBadge';

const formatDate = (value?: string) => {
    if (!value) {
        return '최근 활동 없음';
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

type ElderCardProps = {
    elder: ElderSummary;
    onSelect: () => void;
    onManageContacts?: () => void;
};

export function ElderCard({ elder, onSelect, onManageContacts }: ElderCardProps) {
    const robotConnectionLabel = elder.robotConnected === null || elder.robotConnected === undefined
        ? '알 수 없음'
        : elder.robotConnected
            ? '연결됨'
            : '미연결';

    return (
        <Card className="flex h-full flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{elder.name}</h2>
                    <p className="text-sm text-gray-500">{elder.age}세</p>
                </div>
                <ElderStatusBadge status={elder.status} />
            </div>
            <div className="space-y-1 text-sm text-gray-600">
                <p>최근 활동: {formatDate(elder.lastActivity)}</p>
                <p>위치: {elder.location ?? '정보 없음'}</p>
                <p>로봇 연결: {robotConnectionLabel}</p>
            </div>
            <div className="mt-auto flex flex-col gap-2">
                <Button variant="white" fullWidth onClick={onSelect}>대시보드 보기</Button>
                {onManageContacts ? (
                    <Button variant="secondary" fullWidth onClick={onManageContacts}>긴급 연락처</Button>
                ) : null}
            </div>
        </Card>
    );
}
