import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import type {
    CreateSchedulePayload,
    ScheduleItem,
    ScheduleType,
} from '../types';

type ScheduleFormModalProps = {
    open: boolean;
    mode: 'create' | 'edit';
    initialSchedule?: ScheduleItem | null;
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateSchedulePayload) => void;
};

const scheduleTypeOptions: Array<{ value: ScheduleType; label: string }> = [
    { value: 'HOSPITAL', label: '병원' },
    { value: 'MEDICATION', label: '복약' },
    { value: 'PERSONAL', label: '개인' },
    { value: 'FAMILY', label: '가족' },
    { value: 'OTHER', label: '기타' },
];

const toDateInputValue = (value: string) => {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return value.slice(0, 10);
};

const toTimeInputValue = (value: string) => {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
        const hours = String(parsed.getHours()).padStart(2, '0');
        const minutes = String(parsed.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    return value.slice(11, 16);
};

const createDefaultDate = () => {
    const now = new Date();
    return toDateInputValue(now.toISOString());
};

const createDefaultTime = () => {
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 10) * 10, 0, 0);

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

export function ScheduleFormModal({
    open,
    mode,
    initialSchedule,
    isSubmitting,
    onClose,
    onSubmit,
}: ScheduleFormModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(createDefaultDate());
    const [time, setTime] = useState(createDefaultTime());
    const [location, setLocation] = useState('');
    const [type, setType] = useState<ScheduleType>('OTHER');
    const [remindBeforeMinutes, setRemindBeforeMinutes] = useState('30');

    useEffect(() => {
        if (!open) {
            setTitle('');
            setDescription('');
            setDate(createDefaultDate());
            setTime(createDefaultTime());
            setLocation('');
            setType('OTHER');
            setRemindBeforeMinutes('30');
            return;
        }

        if (mode === 'edit' && initialSchedule) {
            setTitle(initialSchedule.title);
            setDescription(initialSchedule.description ?? '');
            setDate(toDateInputValue(initialSchedule.scheduledAt));
            setTime(toTimeInputValue(initialSchedule.scheduledAt));
            setLocation(initialSchedule.location ?? '');
            setType(initialSchedule.type);
            setRemindBeforeMinutes(String(initialSchedule.remindBeforeMinutes ?? 30));
        }
    }, [initialSchedule, mode, open]);

    const isValid = useMemo(() => {
        return Boolean(title.trim() && date && time);
    }, [date, time, title]);

    if (!open) {
        return null;
    }

    const handleSubmit = () => {
        if (!isValid) {
            return;
        }

        const parsedRemindBefore = Number(remindBeforeMinutes);

        onSubmit({
            title: title.trim(),
            description: description.trim() || null,
            scheduledAt: `${date}T${time}:00`,
            location: location.trim() || null,
            type,
            remindBeforeMinutes: Number.isFinite(parsedRemindBefore) ? parsedRemindBefore : null,
        });
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {mode === 'create' ? '일정 추가' : '일정 수정'}
                    </h2>
                    <button type="button" className="text-sm text-gray-500" onClick={onClose}>
                        닫기
                    </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Input
                        label="제목"
                        placeholder="예: 병원 진료"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                    />
                    <Input
                        label="장소"
                        placeholder="예: 서울대병원"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                    />
                    <Input
                        label="날짜"
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                    />
                    <Input
                        label="시간"
                        type="time"
                        value={time}
                        onChange={(event) => setTime(event.target.value)}
                    />
                    <Input
                        label="알림"
                        type="number"
                        min={0}
                        max={1440}
                        step={5}
                        value={remindBeforeMinutes}
                        hint="일정 몇 분 전에 알림할지 설정합니다."
                        onChange={(event) => setRemindBeforeMinutes(event.target.value)}
                    />
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">일정 유형</span>
                        <div className="grid grid-cols-3 gap-2">
                            {scheduleTypeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`h-12 rounded-md border text-sm font-medium transition-colors ${
                                        type === option.value
                                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setType(option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="schedule-description" className="text-sm font-medium text-gray-700">
                            설명
                        </label>
                        <textarea
                            id="schedule-description"
                            className="mt-1 h-24 w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary-500"
                            placeholder="예: 내과 정기검진"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                        />
                    </div>
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
