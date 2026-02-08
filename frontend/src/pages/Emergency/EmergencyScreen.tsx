import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/shared/ui/Button';
import { EmergencyAlert } from '@/features/emergency/components/EmergencyAlert';
import { ResolveDialog } from '@/features/emergency/components/ResolveDialog';
import { useEmergency } from '@/features/emergency/hooks/useEmergency';
import { getContacts } from '@/features/elder/api/elderApi';

const toTelUri = (phone: string) => `tel:${phone.replace(/[^0-9+*#]/g, '')}`;

function EmergencyScreen() {
    const params = useParams();
    const emergencyId = params.id ? Number(params.id) : undefined;
    const { detailQuery, resolveMutation } = useEmergency(emergencyId);
    const [isResolveOpen, setIsResolveOpen] = useState(false);

    const emergency = detailQuery.data;
    const contactsQuery = useQuery({
        queryKey: ['elder', emergency?.elderId, 'contacts'],
        queryFn: () => getContacts(emergency?.elderId as number),
        enabled: typeof emergency?.elderId === 'number',
    });
    const contacts = contactsQuery.data ?? [];

    return (
        <div className="min-h-screen bg-danger text-white">
            <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-12 text-center">
                {detailQuery.isLoading ? (
                    <p className="text-sm text-white/80">긴급 상황 정보를 불러오는 중...</p>
                ) : detailQuery.isError ? (
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-left">
                        <p className="text-sm text-white/80">긴급 상황 정보를 불러오지 못했습니다.</p>
                    </div>
                ) : emergency ? (
                    <EmergencyAlert emergency={emergency} />
                ) : (
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-left">
                        <p className="text-sm text-white/80">긴급 상황 정보를 찾을 수 없습니다.</p>
                    </div>
                )}
                <section className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-left">
                    <h2 className="text-sm font-semibold text-white/90">긴급 연락처</h2>
                    {!emergency ? (
                        <p className="mt-2 text-sm text-white/70">긴급 상황 정보를 확인하면 연락처를 표시합니다.</p>
                    ) : contactsQuery.isLoading ? (
                        <p className="mt-2 text-sm text-white/70">연락처를 불러오는 중...</p>
                    ) : contactsQuery.isError ? (
                        <p className="mt-2 text-sm text-white/70">연락처를 불러오지 못했습니다.</p>
                    ) : contacts.length === 0 ? (
                        <p className="mt-2 text-sm text-white/70">등록된 긴급 연락처가 없습니다.</p>
                    ) : (
                        <div className="mt-3 space-y-2">
                            {contacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    className="flex items-center justify-between rounded-xl bg-black/15 px-3 py-2"
                                >
                                    <div>
                                        <p className="text-sm font-semibold">{contact.name}</p>
                                        <p className="text-xs text-white/80">
                                            {contact.relation ? `${contact.relation} · ` : ''}
                                            {contact.phone}
                                        </p>
                                    </div>
                                    <a
                                        href={toTelUri(contact.phone)}
                                        className="rounded-lg border border-white/30 px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/15"
                                    >
                                        전화하기
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                <div className="mt-10 space-y-3">
                    <Button
                        variant="white"
                        fullWidth
                        onClick={() => {
                            window.location.href = 'tel:119';
                        }}
                    >
                        119 전화하기
                    </Button>
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => setIsResolveOpen(true)}
                        disabled={!emergency}
                    >
                        상황 해제
                    </Button>
                </div>
            </main>
            <ResolveDialog
                open={isResolveOpen}
                isSaving={resolveMutation.isPending}
                onClose={() => setIsResolveOpen(false)}
                onConfirm={(resolution, note) => {
                    if (!emergencyId) {
                        return;
                    }
                    resolveMutation.mutate(
                        { resolution, note },
                        { onSuccess: () => setIsResolveOpen(false) }
                    );
                }}
            />
        </div>
    );
}

export default EmergencyScreen;
