import * as React from 'react';
import { cn } from '@/shared/utils/cn';
import { Button } from './Button';

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    actionLabel?: string;
    actionIcon?: React.ReactNode;
    onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    description,
    actionLabel,
    actionIcon,
    onAction,
    className,
    ...props
}) => {
    const hasAction = Boolean(actionLabel || actionIcon);

    return (
        <div className={cn('flex items-center justify-between gap-4', className)} {...props}>
            <div className="flex flex-col">
                <h2 className="text-h3 text-gray-900">{title}</h2>
                {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
            {hasAction && (
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={onAction}
                    className="min-h-12"
                >
                    {actionIcon}
                    {actionLabel && <span>{actionLabel}</span>}
                </Button>
            )}
        </div>
    );
};
