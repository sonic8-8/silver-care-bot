import { useEffect, useState } from 'react';
import type { EmergencyResolution } from '@/shared/types';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

const resolutionOptions: { value: EmergencyResolution; label: string }[] = [
    { value: 'RESOLVED', label: '상황 종료' },
    { value: 'FALSE_ALARM', label: '오인 감지' },
    { value: 'EMERGENCY_CALLED', label: '119 신고 완료' },
    { value: 'FAMILY_CONTACTED', label: '보호자 연락 완료' },
];

type ResolveDialogProps = {
    open: boolean;
    isSaving?: boolean;
    onClose: () => void;
    onConfirm: (resolution: EmergencyResolution, note?: string) => void;
};

export function ResolveDialog({ open, isSaving, onClose, onConfirm }: ResolveDialogProps) {
    const [resolution, setResolution] = useState<EmergencyResolution>('RESOLVED');
    const [note, setNote] = useState('');

    useEffect(() => {
        if (!open) {
            setResolution('RESOLVED');
            setNote('');
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const handleConfirm = () => {
        onConfirm(resolution, note.trim() || undefined);
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">상황 처리</h2>
                    <button type="button" className="text-sm text-gray-500" onClick={onClose}>
                        닫기
                    </button>
                </div>
                <div className="mt-4 space-y-3">
                    {resolutionOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={`w-full rounded-lg border px-4 py-3 text-sm font-semibold ${
                                resolution === option.value
                                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                                    : 'border-gray-200 text-gray-600'
                            }`}
                            onClick={() => setResolution(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                    <Input
                        label="메모"
                        placeholder="상황 처리 메모"
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                    />
                </div>
                <div className="mt-6 flex gap-3">
                    <Button variant="white" fullWidth onClick={onClose}>취소</Button>
                    <Button fullWidth onClick={handleConfirm} disabled={isSaving}>
                        {isSaving ? '처리 중...' : '확인'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
