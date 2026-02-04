import type { LucideIcon } from 'lucide-react';

export type ChipVariant = 'info' | 'schedule' | 'medication' | 'listening';

export interface InfoChipProps {
    icon: LucideIcon;
    text: string | undefined;
    variant?: ChipVariant;
}

const CHIP_STYLES: Record<ChipVariant, string> = {
    info: 'text-cyan-400 bg-cyan-950/30 border-cyan-800/50',
    schedule: 'text-blue-400 bg-blue-950/30 border-blue-800/50',
    medication: 'text-amber-400 bg-amber-950/30 border-amber-800/50',
    listening: 'text-cyan-400 bg-cyan-950/20 border-cyan-800/40',
};

const InfoChip = ({ icon: Icon, text, variant = 'info' }: InfoChipProps) => (
    <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border ${CHIP_STYLES[variant]}`}>
        <Icon size={24} />
        <span className="text-lcd-caption font-semibold">{text ?? ''}</span>
    </div>
);

export default InfoChip;
