import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';
import { EmergencyAlert } from '@/features/emergency/components/EmergencyAlert';
import { ResolveDialog } from '@/features/emergency/components/ResolveDialog';
import { useEmergency } from '@/features/emergency/hooks/useEmergency';

function EmergencyScreen() {
    const params = useParams();
    const emergencyId = params.id ? Number(params.id) : undefined;
    const { detailQuery, resolveMutation } = useEmergency(emergencyId);
    const [isResolveOpen, setIsResolveOpen] = useState(false);

    const emergency = detailQuery.data;

    return (
        <div className="min-h-screen bg-danger text-white">
            <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-12 text-center">
                {detailQuery.isLoading ? (
                    <p className="text-sm text-white/80">긴급 상황 정보를 불러오는 중...</p>
                ) : emergency ? (
                    <EmergencyAlert emergency={emergency} />
                ) : (
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-left">
                        <p className="text-sm text-white/80">긴급 상황 정보를 찾을 수 없습니다.</p>
                    </div>
                )}
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
