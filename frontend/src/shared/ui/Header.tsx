import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onLeftClick?: () => void;
    onRightClick?: () => void;
    leftLabel?: string;
    rightLabel?: string;
    transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    leftIcon,
    rightIcon,
    onLeftClick,
    onRightClick,
    leftLabel = 'Back',
    rightLabel = 'Action',
    transparent = false,
    className,
    ...props
}) => {
    return (
        <div
            className={cn(
                'grid grid-cols-[48px_1fr_48px] items-center gap-2',
                transparent
                    ? 'bg-transparent text-white'
                    : 'bg-white/90 text-gray-900 backdrop-blur-md',
                className
            )}
            {...props}
        >
            {leftIcon ? (
                <button
                    type="button"
                    aria-label={leftLabel}
                    onClick={onLeftClick}
                    className={cn(
                        'inline-flex h-12 w-12 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                        transparent
                            ? 'text-white hover:bg-white/10'
                            : 'text-gray-700 hover:bg-gray-100'
                    )}
                >
                    {leftIcon}
                </button>
            ) : (
                <div aria-hidden="true" />
            )}
            <h1 className={cn('text-h2 text-center', transparent ? 'text-white' : 'text-gray-900')}>
                {title}
            </h1>
            {rightIcon ? (
                <button
                    type="button"
                    aria-label={rightLabel}
                    onClick={onRightClick}
                    className={cn(
                        'inline-flex h-12 w-12 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                        transparent
                            ? 'text-white hover:bg-white/10'
                            : 'text-gray-700 hover:bg-gray-100'
                    )}
                >
                    {rightIcon}
                </button>
            ) : (
                <div aria-hidden="true" />
            )}
        </div>
    );
};
