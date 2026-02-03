import type { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'white' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type BadgeStatus = 'safe' | 'warning' | 'danger' | 'neutral';

export interface HeaderAction {
    icon: ReactNode;
    label: string;
    onClick?: () => void;
}
