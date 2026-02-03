import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const buttonVariants = cva(
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-primary-500 text-white hover:bg-primary-600',
                secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
                danger: 'bg-danger text-white hover:bg-danger/90',
                white: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
                dark: 'bg-gray-900 text-white hover:bg-gray-800',
            },
            size: {
                sm: 'px-3 text-sm',
                md: 'px-4 text-base',
                lg: 'px-6 text-lg',
            },
            fullWidth: {
                true: 'w-full',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, fullWidth, type = 'button', ...props }, ref) => {
        return (
            <button
                ref={ref}
                type={type}
                className={cn(buttonVariants({ variant, size, fullWidth }), className)}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';
