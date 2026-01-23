/**
 * 🤖 RobotLCD - Framer Motion 기반 로봇 LCD 화면
 * lcd-impl.html 기반 구현
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Battery, Wifi, Pill, Phone, Clock, Activity, Smile
} from 'lucide-react';

// --- 타입 정의 ---
type RobotMode = 'IDLE' | 'GREETING' | 'MEDICATION' | 'SCHEDULE' | 'LISTENING' | 'EMERGENCY' | 'SLEEP';

interface RobotState {
    mode: RobotMode;
    emotion: 'neutral' | 'happy' | 'angry' | 'surprised' | 'sleep' | 'suspicious';
    message?: string;
    subMessage?: string;
}

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

// --- Eye 컴포넌트 ---
const Eye = ({ variant, variants, side, mousePos, emotion }: any) => {
    const shouldTrack = variant !== 'sleep' && variant !== 'blink' && emotion !== 'suspicious';
    const moveX = shouldTrack ? mousePos.x * 20 : 0;
    const moveY = shouldTrack ? mousePos.y * 20 : 0;

    const angryRotation = side === 'left' ? -15 : 15;
    const rotation = emotion === 'angry' ? angryRotation : 0;

    return (
        <div className="relative">
            <motion.div
                animate={variant}
                variants={variants}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{
                    backgroundColor: COLORS.eye,
                    boxShadow: `0 0 50px 10px ${COLORS.eyeGlow}`,
                    x: moveX,
                    y: moveY,
                    rotate: rotation,
                }}
                className="origin-center"
            />
            <AnimatePresence>
                {variant !== 'blink' && variant !== 'sleep' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} exit={{ opacity: 0 }}
                        className="absolute top-[20%] right-[20%] w-8 h-8 bg-white rounded-full blur-[2px]"
                        style={{ x: moveX, y: moveY }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// --- ScenarioButton 컴포넌트 ---
const ScenarioButton = ({ label, onClick, danger }: any) => (
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

// --- 메인 RobotLCD 컴포넌트 ---
interface RobotLCDProps {
    onLogout?: () => void;
    isPreview?: boolean;
}

const RobotLCD = ({ onLogout, isPreview = false }: RobotLCDProps) => {
    const [state, setState] = useState<RobotState>({
        mode: 'IDLE',
        emotion: 'neutral',
        message: '"할머니~ 오늘도 좋은 하루 되세요!"',
        subMessage: '다음 일정: 병원 방문 (오후 2:00)'
    });

    const [isBlinking, setIsBlinking] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [currentTime, setCurrentTime] = useState(new Date());

    // --- 시계 업데이트 ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
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
    const handleMouseMove = (e: React.MouseEvent) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        setMousePos({ x, y });
    };

    // --- 눈 모양 정의 (Variants) - 1024x600 7인치 LCD 최적화 ---
    const eyeVariants = {
        neutral: { height: 140, width: 110, borderRadius: "50%" },
        happy: { height: 100, width: 120, borderRadius: "40% 40% 60% 60%", y: -5 },
        angry: { height: 130, width: 110, borderRadius: "100% 0% 50% 50%" },
        surprised: { height: 160, width: 120, borderRadius: "50%", scale: 1.1 },
        sleep: { height: 10, width: 130, borderRadius: "10px", opacity: 0.4 },
        suspicious: { height: 60, width: 120, borderRadius: "10px 10px 50% 50%" },
        blink: { height: 6, width: 120, borderRadius: "50%", scaleY: 0.5 },
    };

    // 모드에 따른 눈 위치 조절 - 1024x600 최적화 (SimControls 영역 고려)
    const containerVariants = {
        center: { y: -60, scale: 1 },
        top: { y: -140, scale: 0.45 },
    };

    const currentEyeVariant = isBlinking ? 'blink' : state.emotion;
    const isCompactMode = ['GREETING', 'MEDICATION', 'SCHEDULE', 'LISTENING', 'EMERGENCY'].includes(state.mode);
    const isEmergency = state.mode === 'EMERGENCY';

    // --- SimControls ---
    const SimControls = () => {
        if (isPreview) return null;
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-700 p-3 z-50 overflow-x-auto">
                <div className="flex space-x-2 min-w-max justify-center px-4">
                    <ScenarioButton
                        label="1. 대기"
                        onClick={() => setState({ mode: 'IDLE', emotion: 'neutral', message: '"할머니~ 오늘도 좋은 하루 되세요!"', subMessage: '다음 일정: 병원 방문 (오후 2:00)' })}
                    />
                    <ScenarioButton
                        label="2. 인사"
                        onClick={() => setState({ mode: 'GREETING', emotion: 'happy', message: '"할머니~ 잘 주무셨어요?\n오늘 날씨가 참 좋아요!"', subMessage: '오늘 날씨: 맑음 ☀️' })}
                    />
                    <ScenarioButton
                        label="3. 복약"
                        onClick={() => setState({ mode: 'MEDICATION', emotion: 'neutral', message: '"할머니~ 약 드실 시간이에요!"', subMessage: '아침약 (고혈압, 당뇨) 💊' })}
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
                        onClick={() => setState({ mode: 'SLEEP', emotion: 'sleep', message: '"저 충전하고 올게요...\n안녕히 주무세요 💤"', subMessage: '배터리 충전 중 (75%)' })}
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
            className={`w-full ${isPreview ? 'h-full' : 'h-screen'} flex flex-col items-center overflow-hidden relative transition-colors duration-500`}
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
            <div className="w-full px-4 py-2 flex justify-between items-center z-50 text-white/80 font-mono text-base absolute top-0">
                <div className="flex items-center gap-1">
                    <Clock size={16} />
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Wifi size={16} />
                        <span className="text-xs">연결됨</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Battery size={16} />
                        <span className="text-xs">85%</span>
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
                    className="flex items-center gap-8 sm:gap-16 relative"
                >
                    <Eye variant={currentEyeVariant} variants={eyeVariants} side="left" mousePos={mousePos} emotion={state.emotion} />
                    <Eye variant={currentEyeVariant} variants={eyeVariants} side="right" mousePos={mousePos} emotion={state.emotion} />
                </motion.div>

                {/* 2. 하단 메시지 및 컨트롤 영역 */}
                <AnimatePresence mode='wait'>
                    {/* IDLE 모드 */}
                    {state.mode === 'IDLE' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute bottom-24 text-center space-y-1"
                        >
                            <h2 className="text-2xl font-bold text-white/90">{state.message}</h2>
                            {state.subMessage && (
                                <div className="flex items-center justify-center gap-2 text-cyan-400 bg-cyan-950/30 px-4 py-2 rounded-full backdrop-blur-sm border border-cyan-800/50">
                                    <Activity size={16} />
                                    <span className="text-sm">{state.subMessage}</span>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* GREETING / SCHEDULE / LISTENING */}
                    {['GREETING', 'SCHEDULE', 'LISTENING'].includes(state.mode) && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="absolute bottom-16 w-full max-w-3xl text-center space-y-2"
                        >
                            {state.mode === 'LISTENING' && (
                                <div className="flex justify-center mb-4 gap-2">
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
                            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight whitespace-pre-line">
                                {state.message}
                            </h1>
                            {state.subMessage && (
                                <p className="text-xl text-gray-300 bg-gray-900/50 inline-block px-6 py-3 rounded-2xl">
                                    {state.subMessage}
                                </p>
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
                            className="absolute bottom-16 w-full max-w-4xl px-4 flex flex-col items-center gap-2"
                        >
                            <div className="text-center space-y-1">
                                <div className="flex justify-center gap-1 mb-1">
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
                                <h1 className="text-xl font-bold text-white">{state.message}</h1>
                                <p className="text-sm text-yellow-300">{state.subMessage}</p>
                            </div>

                            <div className="flex w-full gap-3 justify-center">
                                <button
                                    className="flex-1 max-w-[180px] bg-[#00C471] hover:bg-[#00A05B] text-white text-lg font-bold py-3 rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
                                    onClick={() => setState(prev => ({ ...prev, mode: 'IDLE', emotion: 'happy', message: '"잘하셨어요! 건강하세요~"' }))}
                                >
                                    <Smile size={20} /> 응, 먹었어~
                                </button>
                                <button
                                    className="flex-1 max-w-[180px] bg-gray-700 hover:bg-gray-600 text-gray-200 text-lg font-bold py-3 rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
                                    onClick={() => setState(prev => ({ ...prev, mode: 'IDLE', emotion: 'neutral', message: '"나중에 다시 알려드릴게요."' }))}
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
                            className="absolute bottom-16 w-full max-w-lg px-4 flex flex-col items-center gap-2"
                        >
                            <div className="text-center space-y-1">
                                <h1 className="text-xl font-bold text-red-500 bg-black/50 px-3 py-1 rounded-lg">🚨 긴급 상황 🚨</h1>
                                <p className="text-base text-white font-bold">{state.message}</p>
                            </div>

                            <button className="w-full bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2 animate-pulse">
                                <Phone size={24} /> 119 구조 요청
                            </button>
                            <button
                                className="w-full bg-white text-black text-lg font-bold py-2 rounded-xl shadow-lg"
                                onClick={() => setState({ mode: 'IDLE', emotion: 'neutral', message: '"다행이에요. 조심하세요!"' })}
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
