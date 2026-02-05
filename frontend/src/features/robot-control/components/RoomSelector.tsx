import { cn } from '@/shared/utils/cn';

export type RoomOption = {
    value: string;
    label: string;
};

interface RoomSelectorProps {
    value: string;
    options: RoomOption[];
    onChange: (value: string) => void;
}

export function RoomSelector({ value, options, onChange }: RoomSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="room-selector">
                이동할 위치
            </label>
            <select
                id="room-selector"
                className={cn(
                    'h-12 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
                )}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
