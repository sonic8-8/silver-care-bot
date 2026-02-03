import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outline' | 'ghost';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-lg',
                    variant === 'default' && 'border border-gray-200 bg-white shadow-card',
                    variant === 'outline' && 'border border-gray-200 bg-white',
                    variant === 'ghost' && 'bg-white',
                    className
                )}
                {...props}
            />
        );
    }
);

Card.displayName = 'Card';
