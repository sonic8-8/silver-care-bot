import { useEffect, useState } from 'react';
import type { CreateEmergencyContactPayload, EmergencyContact } from '../api/elderApi';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

const defaultForm: CreateEmergencyContactPayload = {
    name: '',
    phone: '',
    relation: '',
    priority: 1,
};

type ContactListModalProps = {
    open: boolean;
    elderName?: string;
    contacts: EmergencyContact[];
    isLoading?: boolean;
    isSaving?: boolean;
    onClose: () => void;
    onCreate: (payload: CreateEmergencyContactPayload) => void;
    onDelete: (contactId: number) => void;
};

export function ContactListModal({
    open,
    elderName,
    contacts,
    isLoading,
    isSaving,
    onClose,
    onCreate,
    onDelete,
}: ContactListModalProps) {
    const [form, setForm] = useState<CreateEmergencyContactPayload>(defaultForm);

    useEffect(() => {
        if (!open) {
            setForm(defaultForm);
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const handleSubmit = () => {
        if (!form.name.trim() || !form.phone.trim()) {
            return;
        }
        onCreate({
            name: form.name.trim(),
            phone: form.phone.trim(),
            relation: form.relation?.trim() || undefined,
            priority: form.priority || 1,
        });
    };

    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">긴급 연락처</h2>
                        <p className="text-sm text-gray-500">{elderName ? `${elderName} 어르신` : '어르신'} 연락처</p>
                    </div>
                    <button type="button" className="text-sm text-gray-500" onClick={onClose}>
                        닫기
                    </button>
                </div>
                <div className="mt-4 space-y-3">
                    {isLoading ? (
                        <p className="text-sm text-gray-500">불러오는 중...</p>
                    ) : contacts.length === 0 ? (
                        <p className="text-sm text-gray-500">등록된 연락처가 없습니다.</p>
                    ) : (
                        <div className="space-y-3">
                            {contacts.map((contact) => (
                                <div key={contact.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
                                        <p className="text-xs text-gray-500">{contact.phone}</p>
                                        {contact.relation ? (
                                            <p className="text-xs text-gray-500">관계: {contact.relation}</p>
                                        ) : null}
                                    </div>
                                    <Button
                                        variant="white"
                                        size="sm"
                                        onClick={() => onDelete(contact.id)}
                                    >
                                        삭제
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h3 className="text-sm font-semibold text-gray-900">연락처 추가</h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <Input
                            label="이름"
                            value={form.name}
                            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                        />
                        <Input
                            label="전화번호"
                            value={form.phone}
                            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                        />
                        <Input
                            label="관계"
                            value={form.relation ?? ''}
                            onChange={(event) => setForm((prev) => ({ ...prev, relation: event.target.value }))}
                        />
                        <Input
                            label="우선순위"
                            type="number"
                            min={1}
                            max={5}
                            value={form.priority ?? 1}
                            onChange={(event) => setForm((prev) => ({
                                ...prev,
                                priority: Number(event.target.value),
                            }))}
                        />
                    </div>
                    <div className="mt-4">
                        <Button
                            fullWidth
                            onClick={handleSubmit}
                            disabled={isSaving || !form.name.trim() || !form.phone.trim()}
                        >
                            {isSaving ? '저장 중...' : '연락처 추가'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
