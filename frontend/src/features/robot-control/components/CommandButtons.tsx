import { Button } from '@/shared/ui/Button';

interface CommandButtonsProps {
    onMove: () => void;
    onReturnDock: () => void;
    onStartPatrol: () => void;
    isLoading?: boolean;
}

export function CommandButtons({ onMove, onReturnDock, onStartPatrol, isLoading = false }: CommandButtonsProps) {
    return (
        <div className="grid gap-2">
            <Button variant="white" fullWidth onClick={onMove} disabled={isLoading}>
                선택 위치로 이동
            </Button>
            <Button variant="white" fullWidth onClick={onReturnDock} disabled={isLoading}>
                충전 도크로 복귀
            </Button>
            <Button variant="white" fullWidth onClick={onStartPatrol} disabled={isLoading}>
                순찰 시작
            </Button>
        </div>
    );
}
