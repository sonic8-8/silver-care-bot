import { useEffect, useState } from 'react';
import type { CreateElderPayload } from '../api/elderApi';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

const genders = [
    { value: 'FEMALE', label: '여성' },
    { value: 'MALE', label: '남성' },
] as const;

type AddElderModalProps = {
    open: boolean;
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateElderPayload) => void;
};

export function AddElderModal({ open, isSubmitting, onClose, onSubmit }: AddElderModalProps) {
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (!open) {
            setName('');
            setBirthDate('');
            setGender('');
            setAddress('');
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const handleSubmit = () => {
        if (!name.trim()) {
            return;
        }
        onSubmit({
            name: name.trim(),
            birthDate: birthDate || undefined,
            gender: gender || undefined,
            address: address.trim() || undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">새 어르신 등록</h2>
                    <button
                        type="button"
                        className="text-sm text-gray-500"
                        onClick={onClose}
                    >
                        닫기
                    </button>
                </div>
                <div className="mt-4 space-y-4">
                    <Input
                        label="이름"
                        placeholder="어르신 이름"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <Input
                        label="생년월일"
                        type="date"
                        value={birthDate}
                        onChange={(event) => setBirthDate(event.target.value)}
                    />
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">성별</span>
                        <div className="grid grid-cols-2 gap-3">
                            {genders.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    className={`h-12 rounded-md border text-sm font-medium ${
                                        gender === item.value
                                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                                            : 'border-gray-200 text-gray-600'
                                    }`}
                                    onClick={() => setGender(item.value)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <Input
                        label="주소"
                        placeholder="주소를 입력하세요"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                    />
                </div>
                <div className="mt-6 flex gap-3">
                    <Button variant="white" fullWidth onClick={onClose}>취소</Button>
                    <Button fullWidth onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
                        {isSubmitting ? '등록 중...' : '등록하기'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
