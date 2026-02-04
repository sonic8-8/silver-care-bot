/**
 * 🤖 RobotLCD - Framer Motion 기반 로봇 LCD 화면
 * lcd-impl.html 기반 구현
 */
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Activity, Battery, Calendar, Clock, CloudSun, Phone, Pill, Siren, Smile, Wifi } from 'lucide-react';

import Eye, { type EyeEmotion, type EyeVariant, type MousePosition } from './Eye';
import InfoChip from './InfoChip';
import SimControls from './SimControls';

export type RobotMode = 'IDLE' | 'GREETING' | 'MEDICATION' | 'SCHEDULE' | 'LISTENING' | 'EMERGENCY' | 'SLEEP';

export interface RobotState {
    mode: RobotMode;
    emotion: EyeEmotion;
    message?: string;
    subMessage?: string;
}

export interface RobotLCDProps {
    onLogout?: () => void;
    isPreview?: boolean;
}

const IDLE_SCHEDULE_THRESHOLD_MINUTES = 90;

const COLORS = {
    bg: '#000000',
};

const COMPACT_MODES: RobotMode[] = ['GREETING', 'MEDICATION', 'SCHEDULE', 'LISTENING', 'EMERGENCY'];

const EYE_VARIANTS: Variants = {
    neutral: { height: 360, width: 270, borderRadius: '50%' },
    happy: { height: 210, width: 360, borderRadius: '200px 200px 20px 20px', y: -20, scaleY: 1 },
    angry: { height: 220, width: 180, borderRadius: '100% 0% 50% 50%' },
    surprised: { height: 360, width: 270, borderRadius: '50%' },
    sleep: { height: 15, width: 270, borderRadius: '10px', opacity: 0.4 },
    suspicious: { height: 120, width: 270, borderRadius: '10px 10px 50% 50%' },
    blink: { height: 8, width: 270, borderRadius: '50%', scaleY: 0.5 },
};

const CONTAINER_VARIANTS: Variants = {
    center: { y: 0, scale: 1 },
    top: { y: -120, scale: 0.6 },
};

const RobotLCD = ({ onLogout, isPreview = false }: RobotLCDProps) => {
    const [state, setState] = useState<RobotState>({
        mode: 'IDLE',
        emotion: 'neutral',
        message: '',
        subMessage: '',
    });
    const [isBlinking, setIsBlinking] = useState(false);
    const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });
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

    const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        setMousePos({ x, y });
    };

    const currentEyeVariant: EyeVariant = isBlinking ? 'blink' : state.emotion;
    const isCompactMode = COMPACT_MODES.includes(state.mode);
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

    return (
        <div
            className="w-full h-full flex flex-col items-center overflow-hidden relative transition-colors duration-500"
            style={{ backgroundColor: isEmergency ? '#300000' : COLORS.bg }}
            onMouseMove={handleMouseMove}
        >
            {isEmergency && (
                <motion.div
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="absolute inset-0 bg-red-600 z-0 pointer-events-none"
                />
            )}

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

            <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10 px-4">
                <motion.div
                    animate={isCompactMode ? 'top' : 'center'}
                    variants={CONTAINER_VARIANTS}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="flex items-center gap-28 sm:gap-56 relative"
                >
                    <Eye variant={currentEyeVariant} variants={EYE_VARIANTS} side="left" mousePos={mousePos} emotion={state.emotion} />
                    <Eye variant={currentEyeVariant} variants={EYE_VARIANTS} side="right" mousePos={mousePos} emotion={state.emotion} />
                </motion.div>

                <AnimatePresence mode="wait">
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
                                    {[1, 2, 3].map((value) => (
                                        <motion.div
                                            key={value}
                                            animate={{ height: [10, 40, 10] }}
                                            transition={{ repeat: Infinity, duration: 1, delay: value * 0.2 }}
                                            className="w-2 bg-cyan-400 rounded-full"
                                        />
                                    ))}
                                </div>
                            )}
                            <h1 className="text-lcd-title font-bold text-white leading-tight whitespace-pre-line">{state.message}</h1>
                            {state.subMessage && (
                                <InfoChip
                                    icon={state.mode === 'GREETING' ? CloudSun : state.mode === 'SCHEDULE' ? Calendar : Activity}
                                    text={state.subMessage}
                                    variant={state.mode === 'SCHEDULE' ? 'schedule' : state.mode === 'LISTENING' ? 'listening' : 'info'}
                                />
                            )}
                        </motion.div>
                    )}

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
                                        setState((previous) => ({ ...previous, mode: 'IDLE', emotion: 'happy', message: '', subMessage: '' }));
                                        showTransientMessage('"잘하셨어요! 건강하세요~"');
                                    }}
                                >
                                    <Smile size={24} /> 응, 먹었어~
                                </button>
                                <button
                                    className="flex-1 max-w-[260px] min-h-[80px] bg-gray-700 hover:bg-gray-600 text-gray-200 text-lcd-body font-semibold rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 px-6"
                                    onClick={() => {
                                        setState((previous) => ({ ...previous, mode: 'IDLE', emotion: 'neutral', message: '', subMessage: '' }));
                                        showTransientMessage('"나중에 다시 알려드릴게요."');
                                    }}
                                >
                                    아직이야
                                </button>
                            </div>
                        </motion.div>
                    )}

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

            <SimControls isPreview={isPreview} onScenarioChange={setState} onLogout={onLogout} />
        </div>
    );
};

export default RobotLCD;
