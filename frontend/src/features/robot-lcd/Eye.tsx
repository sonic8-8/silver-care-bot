import { AnimatePresence, motion, type Variants } from 'framer-motion';

export type EyeEmotion = 'neutral' | 'happy' | 'angry' | 'surprised' | 'sleep' | 'suspicious';
export type EyeVariant = EyeEmotion | 'blink';

export interface MousePosition {
    x: number;
    y: number;
}

export interface EyeProps {
    variant: EyeVariant;
    variants: Variants;
    side: 'left' | 'right';
    mousePos: MousePosition;
    emotion: EyeEmotion;
}

const COLORS = {
    eye: '#22d3ee',
    eyeGlow: 'rgba(34, 211, 238, 0.6)',
};

const Eye = ({ variant, variants, side, mousePos, emotion }: EyeProps) => {
    const shouldTrack = variant !== 'sleep' && variant !== 'blink' && emotion !== 'suspicious';
    const moveX = shouldTrack ? mousePos.x * 20 : 0;
    const moveY = shouldTrack ? mousePos.y * 20 : 0;

    const angryRotation = side === 'left' ? -15 : 15;
    const rotation = emotion === 'angry' ? angryRotation : 0;

    return (
        <motion.div style={{ x: moveX, y: moveY, rotate: rotation }} className="relative">
            <motion.div
                animate={variant}
                variants={variants}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                    backgroundColor: COLORS.eye,
                    boxShadow: `0 0 50px 10px ${COLORS.eyeGlow}`,
                }}
                className="relative overflow-hidden origin-center"
            >
                <motion.div
                    animate={emotion === 'happy' ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-[-105%] left-[-5%] w-[110%] h-[110%] bg-black z-10"
                    style={{
                        borderRadius: '200px 200px 80px 80px',
                        boxShadow: `inset 0 10px 20px 0px ${COLORS.eyeGlow}`,
                        marginTop: '-1px',
                    }}
                />

                <AnimatePresence>
                    {variant !== 'blink' && variant !== 'sleep' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-[20%] right-[20%] w-8 h-8 bg-white rounded-full blur-[2px] z-0"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default Eye;
