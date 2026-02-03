import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
    {
        variants: {
            status: {
                safe: 'bg-safe-bg text-safe',
                warning: 'bg-warning-bg text-warning',
                danger: 'bg-danger-bg text-danger',
                neutral: 'bg-gray-100 text-gray-600',
            },
        },
        defaultVariants: {
            status: 'neutral',
        },
    }
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
    VariantProps<typeof badgeVariants>;

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, status, ...props }, ref) => {
        return (
            <span ref={ref} className={cn(badgeVariants({ status }), className)} {...props} />
        );
    }
);

Badge.displayName = 'Badge';
