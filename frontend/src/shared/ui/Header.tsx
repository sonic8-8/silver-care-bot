import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onLeftClick?: () => void;
    onRightClick?: () => void;
    leftLabel?: string;
    rightLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    leftIcon,
    rightIcon,
    onLeftClick,
    onRightClick,
    leftLabel = 'Back',
    rightLabel = 'Action',
    className,
    ...props
}) => {
    return (
        <div
            className={cn(
                'grid grid-cols-[48px_1fr_48px] items-center gap-2',
                className
            )}
            {...props}
        >
            {leftIcon ? (
                <button
                    type="button"
                    aria-label={leftLabel}
                    onClick={onLeftClick}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                    {leftIcon}
                </button>
            ) : (
                <div aria-hidden="true" />
            )}
            <h1 className="text-h2 text-center text-gray-900">{title}</h1>
            {rightIcon ? (
                <button
                    type="button"
                    aria-label={rightLabel}
                    onClick={onRightClick}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                    {rightIcon}
                </button>
            ) : (
                <div aria-hidden="true" />
            )}
        </div>
    );
};
