import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    hint?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({
        className,
        label,
        hint,
        error,
        leftIcon,
        rightIcon,
        icon,
        id,
        ...props
    }, ref) => {
        const inputId = React.useId();
        const resolvedId = id ?? inputId;
        const resolvedRightIcon = rightIcon ?? icon;

        return (
            <div className="flex flex-col gap-1">
                {label && (
                    <label htmlFor={resolvedId} className="text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {leftIcon}
                        </span>
                    )}
                    {resolvedRightIcon && (
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {resolvedRightIcon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        id={resolvedId}
                        className={cn(
                            'h-12 w-full rounded-md border border-gray-200 bg-white px-4 text-body text-gray-900 placeholder:text-gray-400 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                            leftIcon && 'pl-10',
                            resolvedRightIcon && 'pr-10',
                            error && 'border-danger focus-visible:ring-danger',
                            className
                        )}
                        aria-invalid={Boolean(error)}
                        {...props}
                    />
                </div>
                {error ? (
                    <p className="text-xs text-danger">{error}</p>
                ) : hint ? (
                    <p className="text-xs text-gray-500">{hint}</p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = 'Input';
