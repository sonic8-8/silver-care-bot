import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { Button } from '@/shared/ui/Button';
import {
    createContact,
    createElder,
    deleteContact,
    getContacts,
} from '@/features/elder/api/elderApi';
import { useElders } from '@/features/elder/hooks/useElders';
import { ElderCard } from '@/features/elder/components/ElderCard';
import { AddElderModal } from '@/features/elder/components/AddElderModal';
import { ContactListModal } from '@/features/elder/components/ContactListModal';

function ElderSelectScreen() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data, isLoading } = useElders();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedElderId, setSelectedElderId] = useState<number | null>(null);
    const [selectedElderName, setSelectedElderName] = useState<string | undefined>(undefined);

    const elders = data?.elders ?? [];
    const summary = data?.summary;

    const contactQuery = useQuery({
        queryKey: ['elder-contacts', selectedElderId],
        queryFn: () => getContacts(selectedElderId as number),
        enabled: typeof selectedElderId === 'number',
    });

    const createElderMutation = useMutation({
        mutationFn: createElder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['elders'] });
            setIsAddModalOpen(false);
        },
    });

    const createContactMutation = useMutation({
        mutationFn: ({ elderId, payload }: { elderId: number; payload: Parameters<typeof createContact>[1] }) =>
            createContact(elderId, payload),
        onSuccess: () => {
            if (selectedElderId) {
                queryClient.invalidateQueries({ queryKey: ['elder-contacts', selectedElderId] });
            }
        },
    });

    const deleteContactMutation = useMutation({
        mutationFn: ({ elderId, contactId }: { elderId: number; contactId: number }) =>
            deleteContact(elderId, contactId),
        onSuccess: () => {
            if (selectedElderId) {
                queryClient.invalidateQueries({ queryKey: ['elder-contacts', selectedElderId] });
            }
        },
    });

    const summaryLabel = useMemo(() => {
        if (!summary) {
            return null;
        }
        return `총 ${summary.total}명 · 안전 ${summary.safe} · 주의 ${summary.warning} · 위험 ${summary.danger}`;
    }, [summary]);

    return (
        <GuardianAppContainer
            title="어르신 선택"
            description="담당 어르신을 선택해 상세 대시보드로 이동합니다."
        >
            <SectionHeader title="담당 어르신" description={summaryLabel ?? undefined} />
            {isLoading ? (
                <p className="mt-6 text-sm text-gray-500">목록을 불러오는 중입니다.</p>
            ) : elders.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                    등록된 어르신이 없습니다. 새 어르신을 추가해 주세요.
                </div>
            ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {elders.map((elder) => (
                        <ElderCard
                            key={elder.id}
                            elder={elder}
                            onSelect={() => navigate(`/elders/${elder.id}`)}
                            onManageContacts={() => {
                                setSelectedElderId(elder.id);
                                setSelectedElderName(elder.name);
                            }}
                        />
                    ))}
                </div>
            )}
            <div className="mt-6">
                <Button fullWidth onClick={() => setIsAddModalOpen(true)}>
                    새 어르신 등록
                </Button>
            </div>
            <AddElderModal
                open={isAddModalOpen}
                isSubmitting={createElderMutation.isPending}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={(payload) => createElderMutation.mutate(payload)}
            />
            <ContactListModal
                open={typeof selectedElderId === 'number'}
                elderName={selectedElderName}
                contacts={contactQuery.data ?? []}
                isLoading={contactQuery.isLoading}
                isSaving={createContactMutation.isPending}
                onClose={() => {
                    setSelectedElderId(null);
                    setSelectedElderName(undefined);
                }}
                onCreate={(payload) => {
                    if (selectedElderId) {
                        createContactMutation.mutate({ elderId: selectedElderId, payload });
                    }
                }}
                onDelete={(contactId) => {
                    if (selectedElderId) {
                        deleteContactMutation.mutate({ elderId: selectedElderId, contactId });
                    }
                }}
            />
        </GuardianAppContainer>
    );
}

export default ElderSelectScreen;
