import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import type { CreateMedicationPayload, MedicationFrequency, MedicationItem } from '../types';
import { toLocalDateInputValue } from '../utils/date';

type MedicationFormModalProps = {
    open: boolean;
    mode: 'create' | 'edit';
    initialMedication?: MedicationItem | null;
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateMedicationPayload) => void;
};

const frequencyOptions: Array<{ value: MedicationFrequency; label: string }> = [
    { value: 'MORNING', label: '아침' },
    { value: 'EVENING', label: '저녁' },
    { value: 'BOTH', label: '아침/저녁' },
];

const todayString = () => toLocalDateInputValue();

export function MedicationFormModal({
    open,
    mode,
    initialMedication,
    isSubmitting,
    onClose,
    onSubmit,
}: MedicationFormModalProps) {
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState<MedicationFrequency>('MORNING');
    const [timing, setTiming] = useState('');
    const [startDate, setStartDate] = useState(todayString());
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (!open) {
            setName('');
            setDosage('');
            setFrequency('MORNING');
            setTiming('');
            setStartDate(todayString());
            setEndDate('');
            return;
        }

        if (mode === 'edit' && initialMedication) {
            setName(initialMedication.name);
            setDosage(initialMedication.dosage);
            setFrequency(initialMedication.frequency);
            setTiming(initialMedication.timing ?? '');
            setStartDate(initialMedication.startDate ?? todayString());
            setEndDate(initialMedication.endDate ?? '');
        }
    }, [initialMedication, mode, open]);

    const isValid = useMemo(() => {
        return Boolean(name.trim() && dosage.trim() && startDate);
    }, [dosage, name, startDate]);

    if (!open) {
        return null;
    }

    const handleSubmit = () => {
        if (!isValid) {
            return;
        }

        onSubmit({
            name: name.trim(),
            dosage: dosage.trim(),
            frequency,
            timing: timing.trim() || undefined,
            startDate,
            endDate: endDate || null,
        });
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {mode === 'create' ? '약 추가' : '약 정보 수정'}
                    </h2>
                    <button type="button" className="text-sm text-gray-500" onClick={onClose}>
                        닫기
                    </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Input
                        label="약 이름"
                        placeholder="예: 고혈압약"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <Input
                        label="용량"
                        placeholder="예: 1정"
                        value={dosage}
                        onChange={(event) => setDosage(event.target.value)}
                    />
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">복용 주기</span>
                        <div className="grid grid-cols-3 gap-2">
                            {frequencyOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`h-12 rounded-md border text-sm font-medium transition-colors ${
                                        frequency === option.value
                                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setFrequency(option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <Input
                        label="복용 시점"
                        placeholder="예: 식후 30분"
                        value={timing}
                        onChange={(event) => setTiming(event.target.value)}
                    />
                    <Input
                        label="시작일"
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                    />
                    <Input
                        label="종료일(선택)"
                        type="date"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                    />
                </div>

                <div className="mt-6 flex gap-3">
                    <Button variant="white" fullWidth onClick={onClose}>취소</Button>
                    <Button fullWidth onClick={handleSubmit} disabled={isSubmitting || !isValid}>
                        {isSubmitting ? '저장 중...' : mode === 'create' ? '등록하기' : '수정하기'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
