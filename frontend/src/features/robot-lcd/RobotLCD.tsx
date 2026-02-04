/**
 * 🤖 RobotLCD - Framer Motion 기반 로봇 LCD 화면
 * lcd-impl.html 기반 구현
 */
import { useState, useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Battery, Wifi, Pill, Phone, Clock, Activity, Smile, CloudSun, Siren, Calendar
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// --- 타입 정의 ---
type RobotMode = 'IDLE' | 'GREETING' | 'MEDICATION' | 'SCHEDULE' | 'LISTENING' | 'EMERGENCY' | 'SLEEP';
type ChipVariant = 'info' | 'schedule' | 'medication' | 'listening';

interface RobotState {
    mode: RobotMode;
    emotion: 'neutral' | 'happy' | 'angry' | 'surprised' | 'sleep' | 'suspicious';
    message?: string;
    subMessage?: string;
}

interface MousePosition {
    x: number;
    y: number;
}

type EyeVariant = RobotState['emotion'] | 'blink';

interface EyeProps {
    variant: EyeVariant;
    variants: Record<EyeVariant, { height: number; width: number; borderRadius: string; y?: number; scaleY?: number; opacity?: number }>;
    side: 'left' | 'right';
    mousePos: MousePosition;
    emotion: RobotState['emotion'];
}

const IDLE_SCHEDULE_THRESHOLD_MINUTES = 90;

// --- 다크 시안 테마 (PRD 기준) ---
const COLORS = {
    primary: '#3182F6',
    eye: '#22d3ee',
    eyeGlow: 'rgba(34, 211, 238, 0.6)',
    bg: '#000000',
    danger: '#F04452',
    safe: '#00C471',
    text: '#ffffff',
    textSub: '#9ca3af',
};

const CHIP_STYLES: Record<ChipVariant, string> = {
    info: 'text-cyan-400 bg-cyan-950/30 border-cyan-800/50',
    schedule: 'text-blue-400 bg-blue-950/30 border-blue-800/50',
    medication: 'text-amber-400 bg-amber-950/30 border-amber-800/50',
    listening: 'text-cyan-400 bg-cyan-950/20 border-cyan-800/40',
};

// --- Eye 컴포넌트 ---
const Eye = ({ variant, variants, side, mousePos, emotion }: EyeProps) => {
    const shouldTrack = variant !== 'sleep' && variant !== 'blink' && emotion !== 'suspicious';
    const moveX = shouldTrack ? mousePos.x * 20 : 0;
    const moveY = shouldTrack ? mousePos.y * 20 : 0;

    const angryRotation = side === 'left' ? -15 : 15;
    const rotation = emotion === 'angry' ? angryRotation : 0;

    return (
        <motion.div
            style={{ x: moveX, y: moveY, rotate: rotation }}
            className="relative"
        >
            <motion.div
                animate={variant}
                variants={variants}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{
                    backgroundColor: COLORS.eye,
                    boxShadow: `0 0 50px 10px ${COLORS.eyeGlow}`,
                }}
                className="relative overflow-hidden origin-center"
            >

                <motion.div
                    animate={
                        emotion === 'happy'
                            ? { y: 0, opacity: 1 }
                            : { y: 100, opacity: 0 }
                    }
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-[-105%] left-[-5%] w-[110%] h-[110%] bg-black z-10"
                    style={{
                        borderRadius: "200px 200px 80px 80px",
                        boxShadow: `inset 0 10px 20px 0px ${COLORS.eyeGlow}`,

                        marginTop: "-1px"
                    }}
                >
                </motion.div>

                {/* --- 동공/반사광 --- */}
                <AnimatePresence>
                    {variant !== 'blink' && variant !== 'sleep' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} exit={{ opacity: 0 }}
                            className="absolute top-[20%] right-[20%] w-8 h-8 bg-white rounded-full blur-[2px] z-0"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

// --- ScenarioButton 컴포넌트 ---
interface ScenarioButtonProps {
    label: string;
    onClick: () => void;
    danger?: boolean;
}

const ScenarioButton = ({ label, onClick, danger }: ScenarioButtonProps) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all text-left
      ${danger
                ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}
    `}
    >
        {label}
    </button>
);

interface InfoChipProps {
    icon: LucideIcon;
    text: string | undefined;
    variant?: ChipVariant;
}

const InfoChip = ({ icon: Icon, text, variant = 'info' }: InfoChipProps) => (
    <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border ${CHIP_STYLES[variant]}`}>
        <Icon size={24} />
        <span className="text-lcd-caption font-semibold">{text ?? ''}</span>
    </div>
);

// --- 메인 RobotLCD 컴포넌트 ---
interface RobotLCDProps {
    onLogout?: () => void;
    isPreview?: boolean;
}

const RobotLCD = ({ onLogout, isPreview = false }: RobotLCDProps) => {
    const [state, setState] = useState<RobotState>({
        mode: 'IDLE',
        emotion: 'neutral',
        message: '',
        subMessage: ''
    });

    const [isBlinking, setIsBlinking] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [transientMessage, setTransientMessage] = useState<string | null>(null);
    const transientTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [idleSchedule] = useState(() => {
        const now = new Date();
        const nextScheduleAt = new Date(now);
        nextScheduleAt.setHours(14, 0, 0, 0);
        if (nextScheduleAt <= now) {
            nextScheduleAt.setDate(nextScheduleAt.getDate() + 1);
        }
        return {
            label: '다음 일정: 병원 방문 (오후 2:00)',
            at: nextScheduleAt,
        };
    });

    // --- 시계 업데이트 ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        return () => {
            if (transientTimeoutRef.current) {
                clearTimeout(transientTimeoutRef.current);
            }
        };
    }, []);

    // --- 자동 깜빡임 로직 (SLEEP 모드 제외) ---
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        const scheduleBlink = () => {
            const nextBlinkTime = Math.random() * 3000 + 2000;
            timeoutId = setTimeout(() => {
                if (state.mode !== 'SLEEP') {
                    setIsBlinking(true);
                    setTimeout(() => {
                        setIsBlinking(false);
                        scheduleBlink();
                    }, 150);
                }
            }, nextBlinkTime);
        };
        scheduleBlink();
        return () => clearTimeout(timeoutId);
    }, [state.mode]);

    // --- 마우스 추적 ---
    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        setMousePos({ x, y });
    };

    // --- 눈 모양 정의 (Variants) - 1024x600 7인치 LCD 최적화 ---
    const eyeVariants = {
        neutral: { height: 360, width: 270, borderRadius: "50%" },
        happy: { height: 210, width: 360, borderRadius: "200px 200px 20px 20px", y: -20, scaleY: 1 },
        angry: { height: 220, width: 180, borderRadius: "100% 0% 50% 50%" },
        surprised: { height: 360, width: 270, borderRadius: "50%" },
        sleep: { height: 15, width: 270, borderRadius: "10px", opacity: 0.4 },
        suspicious: { height: 120, width: 270, borderRadius: "10px 10px 50% 50%" },
        blink: { height: 8, width: 270, borderRadius: "50%", scaleY: 0.5 },
    };

    // 모드에 따른 눈 위치 조절 - 1024x600 최적화 (SimControls 영역 고려)
    const containerVariants = {
        center: { y: 0, scale: 1 },
        top: { y: -120, scale: 0.6 },
    };

    const currentEyeVariant = isBlinking ? 'blink' : state.emotion;
    const isCompactMode = ['GREETING', 'MEDICATION', 'SCHEDULE', 'LISTENING', 'EMERGENCY'].includes(state.mode);
    const isEmergency = state.mode === 'EMERGENCY';
    const minutesToIdleSchedule = Math.round((idleSchedule.at.getTime() - currentTime.getTime()) / 60000);
    const shouldShowIdleSchedule = state.mode === 'IDLE'
        && !transientMessage
        && minutesToIdleSchedule >= 0
        && minutesToIdleSchedule <= IDLE_SCHEDULE_THRESHOLD_MINUTES;

    const showTransientMessage = (message: string, durationMs = 3000) => {
        if (transientTimeoutRef.current) {
            clearTimeout(transientTimeoutRef.current);
        }
        setTransientMessage(message);
        transientTimeoutRef.current = setTimeout(() => {
            setTransientMessage(null);
        }, durationMs);
    };

    // --- SimControls ---
    const SimControls = () => {
        if (isPreview) return null;
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-700 p-3 z-50 overflow-x-auto">
                <div className="flex space-x-2 min-w-max justify-center px-4">
                    <ScenarioButton
                        label="1. 대기"
                        onClick={() => setState({ mode: 'IDLE', emotion: 'neutral', message: '', subMessage: '' })}
                    />
                    <ScenarioButton
                        label="2. 인사"
                        onClick={() => setState({ mode: 'GREETING', emotion: 'happy', message: '"할머니~ 잘 주무셨어요?\n오늘 날씨가 참 좋아요!"', subMessage: '오늘 날씨: 맑음' })}
                    />
                    <ScenarioButton
                        label="3. 복약"
                        onClick={() => setState({ mode: 'MEDICATION', emotion: 'neutral', message: '"할머니~ 약 드실 시간이에요!"', subMessage: '아침약 (고혈압, 당뇨)' })}
                    />
                    <ScenarioButton
                        label="4. 일정"
                        onClick={() => setState({ mode: 'SCHEDULE', emotion: 'surprised', message: '"잊지 마세요!\n곧 병원에 가셔야 해요."', subMessage: '오후 2:00 서울대병원 내과' })}
                    />
                    <ScenarioButton
                        label="5. 듣기"
                        onClick={() => setState({ mode: 'LISTENING', emotion: 'happy', message: '"네, 듣고 있어요...\n말씀해 주세요!"' })}
                    />
                    <ScenarioButton
                        label="6. 긴급"
                        onClick={() => setState({ mode: 'EMERGENCY', emotion: 'surprised', message: '낙상이 감지되었습니다!\n괜찮으신가요?!' })}
                        danger
                    />
                    <ScenarioButton
                        label="7. 충전"
                        onClick={() => setState({ mode: 'SLEEP', emotion: 'sleep', message: '"저 충전하고 올게요...\n안녕히 주무세요"', subMessage: '배터리 충전 중 (75%)' })}
                    />
                    <div className="w-px h-8 bg-gray-700 mx-2"></div>
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="px-3 py-2.5 min-h-[48px] rounded-lg text-xs font-bold bg-gray-800 text-red-400 border border-red-900/50"
                        >
                            종료
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div
            className="w-full h-full flex flex-col items-center overflow-hidden relative transition-colors duration-500"
            style={{ backgroundColor: isEmergency ? '#300000' : COLORS.bg }}
            onMouseMove={handleMouseMove}
        >
            {/* --- 긴급 상황 배경 애니메이션 --- */}
            {isEmergency && (
                <motion.div
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="absolute inset-0 bg-red-600 z-0 pointer-events-none"
                />
            )}

            {/* --- 상단 상태바 (Top Bar) - 1024x600 최적화 --- */}
            <div className="w-full px-8 py-4 flex justify-between items-center z-50 text-white/80 font-mono text-lcd-caption absolute top-0">
                <div className="flex items-center gap-2">
                    <Clock size={20} />
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Wifi size={20} />
                        <span>연결됨</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Battery size={20} />
                        <span>85%</span>
                    </div>
                </div>
            </div>

            {/* --- 메인 영역 (눈 + 메시지) --- */}
            <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10 px-4">

                {/* 1. 눈 영역 (가변 레이아웃) */}
                <motion.div
                    animate={isCompactMode ? "top" : "center"}
                    variants={containerVariants}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="flex items-center gap-28 sm:gap-56 relative"
                >
                    <Eye variant={currentEyeVariant} variants={eyeVariants} side="left" mousePos={mousePos} emotion={state.emotion} />
                    <Eye variant={currentEyeVariant} variants={eyeVariants} side="right" mousePos={mousePos} emotion={state.emotion} />
                </motion.div>

                {/* 2. 하단 메시지 및 컨트롤 영역 */}
                <AnimatePresence mode='wait'>
                    {/* IDLE 모드 */}
                    {state.mode === 'IDLE' && transientMessage && (
                        <motion.div
                            key="idle-reassure"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute bottom-20 text-center space-y-2"
                        >
                            <h2 className="text-lcd-body font-semibold text-white/90">{transientMessage}</h2>
                        </motion.div>
                    )}

                    {state.mode === 'IDLE' && shouldShowIdleSchedule && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute bottom-20 text-center space-y-2"
                        >
                            <InfoChip icon={Activity} text={idleSchedule.label} variant="info" />
                        </motion.div>
                    )}

                    {/* GREETING / SCHEDULE / LISTENING */}
                    {['GREETING', 'SCHEDULE', 'LISTENING'].includes(state.mode) && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="absolute bottom-20 w-full max-w-3xl text-center space-y-6"
                        >
                            {state.mode === 'LISTENING' && (
                                <div className="flex items-end justify-center mb-4 gap-2 h-10">
                                    {[1, 2, 3].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [10, 40, 10] }}
                                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                            className="w-2 bg-cyan-400 rounded-full"
                                        />
                                    ))}
                                </div>
                            )}
                            <h1 className="text-lcd-title font-bold text-white leading-tight whitespace-pre-line">
                                {state.message}
                            </h1>
                            {state.subMessage && (
                                <InfoChip
                                    icon={state.mode === 'GREETING' ? CloudSun : state.mode === 'SCHEDULE' ? Calendar : Activity}
                                    text={state.subMessage}
                                    variant={state.mode === 'SCHEDULE' ? 'schedule' : state.mode === 'LISTENING' ? 'listening' : 'info'}
                                />
                            )}
                        </motion.div>
                    )}

                    {/* MEDICATION */}
                    {state.mode === 'MEDICATION' && (
                        <motion.div
                            key="medication"
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="absolute bottom-12 w-full max-w-4xl px-4 flex flex-col items-center gap-8"
                        >
                            <div className="text-center space-y-2">
                                <div className="flex justify-center gap-2 mb-2">
                                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6 }}>
                                        <Pill size={28} className="text-yellow-400" />
                                    </motion.div>
                                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}>
                                        <Pill size={28} className="text-pink-400" />
                                    </motion.div>
                                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}>
                                        <Pill size={28} className="text-white" />
                                    </motion.div>
                                </div>
                                <h1 className="text-lcd-body font-normal text-white">{state.message}</h1>
                                <InfoChip icon={Pill} text={state.subMessage} variant="medication" />
                            </div>

                            <div className="flex w-full gap-3 justify-center">
                                <button
                                    className="flex-1 max-w-[260px] min-h-[80px] bg-[#00C471] hover:bg-[#00A05B] text-white text-lcd-body font-semibold rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 px-6"
                                    onClick={() => {
                                        setState(prev => ({ ...prev, mode: 'IDLE', emotion: 'happy', message: '', subMessage: '' }));
                                        showTransientMessage('"잘하셨어요! 건강하세요~"');
                                    }}
                                >
                                    <Smile size={24} /> 응, 먹었어~
                                </button>
                                <button
                                    className="flex-1 max-w-[260px] min-h-[80px] bg-gray-700 hover:bg-gray-600 text-gray-200 text-lcd-body font-semibold rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 px-6"
                                    onClick={() => {
                                        setState(prev => ({ ...prev, mode: 'IDLE', emotion: 'neutral', message: '', subMessage: '' }));
                                        showTransientMessage('"나중에 다시 알려드릴게요."');
                                    }}
                                >
                                    아직이야
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* EMERGENCY */}
                    {state.mode === 'EMERGENCY' && (
                        <motion.div
                            key="emergency"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-16 w-full max-w-2xl px-6 flex flex-col items-center gap-6"
                        >
                            <div className="text-center space-y-1">
                                <h1 className="text-lcd-title font-bold text-red-500 bg-black/50 px-4 py-2 rounded-lg flex items-center justify-center gap-3">
                                    <Siren size={32} className="text-red-500" />
                                    <span>긴급 상황</span>
                                </h1>
                                <p className="text-lcd-body text-white font-semibold">{state.message}</p>
                            </div>

                            <button className="w-full min-h-[80px] bg-red-600 hover:bg-red-700 text-white text-lcd-body font-semibold rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2 animate-pulse px-6">
                                <Phone size={28} /> 119 구조 요청
                            </button>
                            <button
                                className="w-full min-h-[64px] bg-white text-black text-lcd-body font-semibold rounded-xl shadow-lg px-6"
                                onClick={() => {
                                    setState({ mode: 'IDLE', emotion: 'neutral', message: '', subMessage: '' });
                                    showTransientMessage('다행이에요. 조심하세요!');
                                }}
                            >
                                괜찮아요, 오인 감지
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <SimControls />
        </div>
    );
};

export default RobotLCD;
