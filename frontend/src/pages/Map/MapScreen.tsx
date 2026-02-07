import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Camera,
    Compass,
    ImageOff,
    MapPinned,
    Radio,
    RefreshCcw,
    Route,
} from 'lucide-react';
import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';
import { Button } from '@/shared/ui/Button';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useElderMap, usePatrolSnapshots } from '@/features/map/hooks/useMap';
import { useRobotLocationRealtime } from '@/features/map/hooks/useRobotLocationRealtime';
import type { MapRoom, PatrolSnapshot, RobotMapPosition } from '@/features/map/types';

type TabKey = 'map' | 'snapshot';

type MapExtents = {
    minX: number;
    minY: number;
    width: number;
    height: number;
};

const roomTypeColorMap: Record<MapRoom['type'], string> = {
    BEDROOM: '#fef3c7',
    LIVING_ROOM: '#dbeafe',
    BATHROOM: '#dcfce7',
    KITCHEN: '#fae8ff',
    ENTRANCE: '#fee2e2',
    OTHER: '#e5e7eb',
};

const computeMapExtents = (rooms: MapRoom[]): MapExtents => {
    if (rooms.length === 0) {
        return {
            minX: 0,
            minY: 0,
            width: 720,
            height: 420,
        };
    }

    const minX = Math.min(...rooms.map((room) => room.bounds.x));
    const minY = Math.min(...rooms.map((room) => room.bounds.y));
    const maxX = Math.max(...rooms.map((room) => room.bounds.x + room.bounds.width));
    const maxY = Math.max(...rooms.map((room) => room.bounds.y + room.bounds.height));

    return {
        minX,
        minY,
        width: Math.max(320, Math.ceil(maxX - minX + 40)),
        height: Math.max(240, Math.ceil(maxY - minY + 40)),
    };
};

const normalizePosition = (
    restPosition: RobotMapPosition | null,
    realtimePosition: {
        x: number;
        y: number;
        roomId: string | null;
        heading: number | null;
        timestamp: string | null;
    } | null
) => {
    if (realtimePosition) {
        return realtimePosition;
    }
    if (restPosition) {
        return restPosition;
    }
    return null;
};

const drawMapCanvas = (
    canvas: HTMLCanvasElement,
    rooms: MapRoom[],
    extents: MapExtents,
    robotPosition: ReturnType<typeof normalizePosition>
) => {
    const context = canvas.getContext('2d');
    if (!context) {
        return;
    }

    const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.floor(extents.width * devicePixelRatio);
    canvas.height = Math.floor(extents.height * devicePixelRatio);
    canvas.style.width = `${extents.width}px`;
    canvas.style.height = `${extents.height}px`;
    canvas.style.maxWidth = '100%';
    canvas.style.borderRadius = '12px';
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    context.clearRect(0, 0, extents.width, extents.height);
    context.fillStyle = '#f8fafc';
    context.fillRect(0, 0, extents.width, extents.height);

    rooms.forEach((room) => {
        const left = room.bounds.x - extents.minX + 20;
        const top = room.bounds.y - extents.minY + 20;
        const width = room.bounds.width;
        const height = room.bounds.height;

        context.fillStyle = roomTypeColorMap[room.type];
        context.strokeStyle = '#cbd5e1';
        context.lineWidth = 1.5;
        context.fillRect(left, top, width, height);
        context.strokeRect(left, top, width, height);

        context.fillStyle = '#334155';
        context.font = '600 12px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(room.name, left + width / 2, top + height / 2);
    });

    if (!robotPosition) {
        return;
    }

    const robotX = robotPosition.x - extents.minX + 20;
    const robotY = robotPosition.y - extents.minY + 20;

    context.beginPath();
    context.arc(robotX, robotY, 9, 0, Math.PI * 2);
    context.fillStyle = '#2563eb';
    context.fill();
    context.strokeStyle = '#1e40af';
    context.lineWidth = 2;
    context.stroke();

    if (typeof robotPosition.heading === 'number') {
        const radians = (robotPosition.heading * Math.PI) / 180;
        const tailLength = 20;
        const targetX = robotX + Math.cos(radians) * tailLength;
        const targetY = robotY + Math.sin(radians) * tailLength;

        context.beginPath();
        context.moveTo(robotX, robotY);
        context.lineTo(targetX, targetY);
        context.strokeStyle = '#1e3a8a';
        context.lineWidth = 2;
        context.stroke();
    }
};

const formatDateTime = (value: string | null) => {
    if (!value) {
        return '-';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(parsed);
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
};

function MapScreen() {
    const navigate = useNavigate();
    const { elderId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const parsedElderId = Number(elderId);
    const isValidElderId = Number.isFinite(parsedElderId);
    const token = useAuthStore((state) => state.tokens?.accessToken ?? null);

    const [activeTab, setActiveTab] = useState<TabKey>('map');
    const [draftPatrolId, setDraftPatrolId] = useState(() => searchParams.get('patrolId') ?? '');
    const [selectedSnapshot, setSelectedSnapshot] = useState<PatrolSnapshot | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const dashboardQuery = useDashboard(isValidElderId ? parsedElderId : undefined);
    const mapQuery = useElderMap(isValidElderId ? parsedElderId : undefined, activeTab === 'map');

    const latestPatrolId = dashboardQuery.data?.latestPatrol?.patrolId ?? '';
    const fixedPatrolId = (searchParams.get('patrolId') ?? '').trim();
    const selectedPatrolId = fixedPatrolId || latestPatrolId;
    const robotId = dashboardQuery.data?.robotStatus?.id ?? null;

    useEffect(() => {
        setDraftPatrolId(fixedPatrolId);
    }, [fixedPatrolId]);

    const locationRealtime = useRobotLocationRealtime({
        token,
        robotId,
        elderId: isValidElderId ? parsedElderId : null,
        enabled: activeTab === 'map',
    });

    const snapshotQuery = usePatrolSnapshots(
        selectedPatrolId || undefined,
        activeTab === 'snapshot' && Boolean(selectedPatrolId)
    );

    const extents = useMemo(() => {
        return computeMapExtents(mapQuery.data?.rooms ?? []);
    }, [mapQuery.data?.rooms]);

    const mergedPosition = useMemo(() => {
        return normalizePosition(
            mapQuery.data?.robotPosition ?? null,
            locationRealtime.position
                ? {
                    x: locationRealtime.position.x,
                    y: locationRealtime.position.y,
                    roomId: locationRealtime.position.roomId,
                    heading: locationRealtime.position.heading,
                    timestamp: locationRealtime.position.timestamp,
                }
                : null
        );
    }, [locationRealtime.position, mapQuery.data?.robotPosition]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !mapQuery.data) {
            return;
        }

        drawMapCanvas(canvas, mapQuery.data.rooms, extents, mergedPosition);
    }, [extents, mapQuery.data, mergedPosition]);

    const applyPatrolId = () => {
        const nextPatrolId = draftPatrolId.trim();
        const nextParams = new URLSearchParams(searchParams);
        if (nextPatrolId) {
            nextParams.set('patrolId', nextPatrolId);
        } else {
            nextParams.delete('patrolId');
        }
        setSearchParams(nextParams);
    };

    if (!isValidElderId) {
        return (
            <GuardianAppContainer title="지도/스냅샷" description="안심 지도와 순찰 스냅샷을 확인합니다.">
                <div className="rounded-2xl border border-danger bg-danger-bg p-5 text-sm text-danger">
                    잘못된 어르신 정보입니다. 경로를 다시 확인해 주세요.
                </div>
            </GuardianAppContainer>
        );
    }

    return (
        <GuardianAppContainer title="지도/스냅샷" description="안심 지도와 순찰 스냅샷을 확인합니다.">
            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="white" onClick={() => navigate(`/elders/${parsedElderId}`)}>
                            대시보드로 이동
                        </Button>
                        <span className="text-xs text-gray-500">elderId: {parsedElderId}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${locationRealtime.isConnected ? 'text-safe' : 'text-gray-500'}`}>
                        <Radio size={12} />
                        {locationRealtime.isConnected ? '실시간 위치 연결됨' : '실시간 연결 대기'}
                    </span>
                </div>
            </section>

            <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-2 shadow-card">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('map')}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'map' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        안심 지도
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('snapshot')}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'snapshot' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        스냅샷 갤러리
                    </button>
                </div>
            </section>

            {activeTab === 'map' ? (
                <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <MapPinned size={16} className="text-primary-600" />
                            <h2 className="text-sm font-semibold text-gray-700">Canvas 지도 렌더링</h2>
                        </div>
                        <Button size="sm" variant="white" onClick={() => mapQuery.refetch()}>
                            <RefreshCcw size={14} /> 새로고침
                        </Button>
                    </div>

                    {mapQuery.isLoading ? (
                        <div className="mt-4 h-56 animate-pulse rounded-xl bg-gray-100" />
                    ) : mapQuery.isError ? (
                        <div className="mt-4 rounded-xl border border-danger bg-danger-bg p-4 text-sm text-danger">
                            <p>지도를 불러오지 못했습니다.</p>
                            <p className="mt-1 text-xs">{getErrorMessage(mapQuery.error, '알 수 없는 오류가 발생했습니다.')}</p>
                        </div>
                    ) : (mapQuery.data?.rooms.length ?? 0) === 0 ? (
                        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                            지도 데이터가 아직 없습니다. Map API 연동 완료 후 다시 확인해 주세요.
                        </div>
                    ) : (
                        <>
                            <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-slate-50 p-3">
                                <canvas ref={canvasRef} className="mx-auto block" />
                            </div>
                            <dl className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                    <dt className="text-xs text-gray-500">맵 ID</dt>
                                    <dd className="font-semibold text-gray-900">{mapQuery.data?.mapId ?? '-'}</dd>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                    <dt className="text-xs text-gray-500">마지막 업데이트</dt>
                                    <dd className="font-semibold text-gray-900">{formatDateTime(mapQuery.data?.lastUpdatedAt ?? null)}</dd>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                    <dt className="text-xs text-gray-500">현재 좌표</dt>
                                    <dd className="font-semibold text-gray-900">
                                        {mergedPosition ? `(${mergedPosition.x.toFixed(1)}, ${mergedPosition.y.toFixed(1)})` : '-'}
                                    </dd>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                    <dt className="text-xs text-gray-500">방/방향</dt>
                                    <dd className="font-semibold text-gray-900">
                                        {mergedPosition ? `${mergedPosition.roomId ?? '-'} / ${mergedPosition.heading ?? '-'}°` : '-'}
                                    </dd>
                                </div>
                            </dl>
                        </>
                    )}
                </section>
            ) : (
                <section className="mt-4 space-y-4">
                    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Camera size={16} className="text-primary-600" />
                                <h2 className="text-sm font-semibold text-gray-700">순찰 스냅샷 조회</h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <input
                                    type="text"
                                    value={draftPatrolId}
                                    onChange={(event) => setDraftPatrolId(event.target.value)}
                                    placeholder={latestPatrolId || 'patrol-20260207-0930'}
                                    className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary-400"
                                />
                                <Button size="sm" variant="white" onClick={applyPatrolId}>
                                    적용
                                </Button>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            현재 조회 Patrol ID: <span className="font-semibold text-gray-700">{selectedPatrolId || '-'}</span>
                        </p>
                    </article>

                    {!selectedPatrolId ? (
                        <article className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500 shadow-card">
                            대시보드의 최신 순찰 ID가 없거나 수동 입력값이 없습니다.
                        </article>
                    ) : snapshotQuery.isLoading ? (
                        <article className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="h-56 animate-pulse rounded-2xl bg-gray-100" />
                            ))}
                        </article>
                    ) : snapshotQuery.isError ? (
                        <article className="rounded-2xl border border-danger bg-danger-bg p-5 text-sm text-danger shadow-card">
                            <p>스냅샷을 불러오지 못했습니다.</p>
                            <p className="mt-1 text-xs">{getErrorMessage(snapshotQuery.error, '알 수 없는 오류가 발생했습니다.')}</p>
                            <Button size="sm" className="mt-3" onClick={() => snapshotQuery.refetch()}>
                                다시 시도
                            </Button>
                        </article>
                    ) : (snapshotQuery.data?.snapshots.length ?? 0) === 0 ? (
                        <article className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500 shadow-card">
                            선택한 순찰의 스냅샷이 없습니다.
                        </article>
                    ) : (
                        <article className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {(snapshotQuery.data?.snapshots ?? []).map((snapshot) => (
                                <button
                                    key={snapshot.id}
                                    type="button"
                                    onClick={() => setSelectedSnapshot(snapshot)}
                                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
                                >
                                    {snapshot.thumbnailUrl ? (
                                        <img
                                            src={snapshot.thumbnailUrl}
                                            alt={`순찰 스냅샷 ${snapshot.id}`}
                                            className="h-40 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-40 items-center justify-center bg-gray-100 text-gray-400">
                                            <ImageOff size={20} />
                                        </div>
                                    )}
                                    <div className="space-y-1 p-3">
                                        <p className="truncate text-sm font-semibold text-gray-900">{snapshot.roomName ?? snapshot.target ?? '미분류'}</p>
                                        <p className="text-xs text-gray-500">{formatDateTime(snapshot.capturedAt)}</p>
                                        <p className="text-xs text-gray-500">
                                            상태: {snapshot.status ?? '-'}
                                            {typeof snapshot.confidence === 'number' ? ` (신뢰도 ${(snapshot.confidence * 100).toFixed(0)}%)` : ''}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </article>
                    )}
                </section>
            )}

            {selectedSnapshot ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Route size={16} className="text-primary-600" />
                                <p className="text-sm font-semibold text-gray-900">스냅샷 미리보기</p>
                            </div>
                            <Button size="sm" variant="white" onClick={() => setSelectedSnapshot(null)}>
                                닫기
                            </Button>
                        </div>
                        <div className="bg-gray-50 p-4">
                            {selectedSnapshot.imageUrl ? (
                                <img
                                    src={selectedSnapshot.imageUrl}
                                    alt={`순찰 스냅샷 ${selectedSnapshot.id}`}
                                    className="max-h-[70vh] w-full rounded-xl object-contain"
                                />
                            ) : (
                                <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-gray-300 text-gray-500">
                                    이미지 URL이 없습니다.
                                </div>
                            )}
                            <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-3">
                                <p>촬영 시각: {formatDateTime(selectedSnapshot.capturedAt)}</p>
                                <p>방: {selectedSnapshot.roomName ?? selectedSnapshot.roomId ?? '-'}</p>
                                <p>대상: {selectedSnapshot.target ?? '-'} / 상태: {selectedSnapshot.status ?? '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-card">
                <p className="text-xs font-semibold text-gray-500">연동 메모</p>
                <ul className="mt-2 space-y-1 text-xs text-gray-500">
                    <li className="flex items-center gap-1">
                        <Compass size={12} />
                        지도는 <code>GET /api/elders/{"{elderId}"}/map</code> 데이터를 Canvas로 렌더링합니다.
                    </li>
                    <li className="flex items-center gap-1">
                        <Radio size={12} />
                        실시간 위치는 <code>/topic/robot/{"{robotId}"}/location</code> 구독 시 즉시 좌표 반영됩니다.
                    </li>
                    <li className="flex items-center gap-1">
                        <Camera size={12} />
                        스냅샷은 <code>GET /api/patrol/{"{patrolId}"}/snapshots</code>를 사용합니다.
                    </li>
                </ul>
            </section>
        </GuardianAppContainer>
    );
}

export default MapScreen;
