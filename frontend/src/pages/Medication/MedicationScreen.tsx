import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pencil, Pill, Plus, Trash2 } from 'lucide-react';
import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';
import { Button } from '@/shared/ui/Button';
import {
    useCreateMedication,
    useDeleteMedication,
    useMedications,
    useUpdateMedication,
} from '@/features/medication/hooks/useMedications';
import { MedicationFormModal } from '@/features/medication/components/MedicationFormModal';
import { WeeklyMedicationChart } from '@/features/medication/components/WeeklyMedicationChart';
import { MedicationStatusCalendar } from '@/features/medication/components/MedicationStatusCalendar';
import type { CreateMedicationPayload, MedicationFrequency, MedicationItem } from '@/features/medication/types';

const frequencyLabelMap: Record<MedicationFrequency, string> = {
    MORNING: '아침',
    EVENING: '저녁',
    BOTH: '아침/저녁',
};

function MedicationScreen() {
    const { elderId } = useParams();
    const parsedElderId = Number(elderId);
    const isValidElderId = Number.isFinite(parsedElderId);

    const medicationQuery = useMedications(isValidElderId ? parsedElderId : undefined);
    const createMutation = useCreateMedication(isValidElderId ? parsedElderId : undefined);
    const updateMutation = useUpdateMedication(isValidElderId ? parsedElderId : undefined);
    const deleteMutation = useDeleteMedication(isValidElderId ? parsedElderId : undefined);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMedication, setEditingMedication] = useState<MedicationItem | null>(null);

    const medications = medicationQuery.data?.medications ?? [];
    const dailyStatus = medicationQuery.data?.dailyStatus ?? [];
    const dispenser = medicationQuery.data?.dispenser;

    const mutationError = createMutation.error ?? updateMutation.error ?? deleteMutation.error;

    const mutationErrorMessage = useMemo(() => {
        if (mutationError instanceof Error) {
            return mutationError.message;
        }
        return null;
    }, [mutationError]);

    const openCreateModal = () => {
        setEditingMedication(null);
        setIsModalOpen(true);
    };

    const openEditModal = (medication: MedicationItem) => {
        setEditingMedication(medication);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingMedication(null);
        setIsModalOpen(false);
    };

    const handleSubmitMedication = async (payload: CreateMedicationPayload) => {
        try {
            if (editingMedication) {
                await updateMutation.mutateAsync({
                    medicationId: editingMedication.id,
                    payload,
                });
            } else {
                await createMutation.mutateAsync(payload);
            }

            closeModal();
        } catch {
            // mutation error is surfaced through mutation state
        }
    };

    const handleDeleteMedication = async (medicationId: number) => {
        const shouldDelete = window.confirm('해당 약 정보를 삭제하시겠습니까?');
        if (!shouldDelete) {
            return;
        }

        try {
            await deleteMutation.mutateAsync(medicationId);
        } catch {
            // mutation error is surfaced through mutation state
        }
    };

    if (!isValidElderId) {
        return (
            <GuardianAppContainer title="약 관리" description="복약 일정과 기록을 관리합니다.">
                <div className="rounded-2xl border border-danger bg-danger-bg p-5 text-sm text-danger">
                    잘못된 어르신 정보입니다. 경로를 다시 확인해 주세요.
                </div>
            </GuardianAppContainer>
        );
    }

    return (
        <GuardianAppContainer title="약 관리" description="복약 일정과 기록을 관리합니다.">
            {medicationQuery.isLoading ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500 shadow-card">
                    복약 정보를 불러오는 중입니다...
                </div>
            ) : medicationQuery.isError ? (
                <div className="rounded-2xl border border-danger bg-danger-bg p-5 text-sm text-danger">
                    <p>복약 정보를 불러오지 못했습니다.</p>
                    <Button className="mt-3" size="sm" onClick={() => medicationQuery.refetch()}>다시 시도</Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {mutationErrorMessage ? (
                        <div className="rounded-xl border border-danger bg-danger-bg p-4 text-sm text-danger">
                            {mutationErrorMessage}
                        </div>
                    ) : null}

                    <section className="grid gap-4 md:grid-cols-2">
                        <WeeklyMedicationChart weeklyStatus={medicationQuery.data?.weeklyStatus} />
                        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                            <h2 className="text-sm font-semibold text-gray-500">디스펜서 상태</h2>
                            {dispenser ? (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <div className="flex items-center justify-between">
                                        <span>잔여량</span>
                                        <span className="font-semibold text-gray-900">
                                            {dispenser.remaining} / {dispenser.capacity}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>보충 필요</span>
                                        <span className={`font-semibold ${dispenser.needsRefill ? 'text-danger' : 'text-safe'}`}>
                                            {dispenser.needsRefill ? '필요' : '정상'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>예상 소진</span>
                                        <span className="font-semibold text-gray-900">
                                            {typeof dispenser.daysUntilEmpty === 'number'
                                                ? `${dispenser.daysUntilEmpty}일 후`
                                                : '-'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-4 text-sm text-gray-500">디스펜서 정보가 없습니다.</p>
                            )}
                        </article>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-sm font-semibold text-gray-500">복약 목록</h2>
                            <Button size="sm" onClick={openCreateModal}>
                                <Plus size={16} />
                                약 추가
                            </Button>
                        </div>

                        {medications.length === 0 ? (
                            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                등록된 약이 없습니다. 약 추가 버튼으로 시작해 주세요.
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {medications.map((medication) => (
                                    <article key={medication.id} className="rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 rounded-lg bg-primary-50 p-2 text-primary-600">
                                                    <Pill size={16} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900">{medication.name}</h3>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {medication.dosage} · {frequencyLabelMap[medication.frequency]}
                                                        {medication.timing ? ` · ${medication.timing}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="white"
                                                    size="sm"
                                                    onClick={() => openEditModal(medication)}
                                                >
                                                    <Pencil size={14} />
                                                    수정
                                                </Button>
                                                <Button
                                                    variant="white"
                                                    size="sm"
                                                    onClick={() => void handleDeleteMedication(medication.id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 size={14} />
                                                    삭제
                                                </Button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    <MedicationStatusCalendar dailyStatus={dailyStatus} />
                </div>
            )}

            <MedicationFormModal
                open={isModalOpen}
                mode={editingMedication ? 'edit' : 'create'}
                initialMedication={editingMedication}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                onClose={closeModal}
                onSubmit={(payload) => {
                    void handleSubmitMedication(payload);
                }}
            />
        </GuardianAppContainer>
    );
}

export default MedicationScreen;
