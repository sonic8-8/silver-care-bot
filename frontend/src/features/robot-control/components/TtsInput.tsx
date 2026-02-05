import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

interface TtsInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    isLoading?: boolean;
}

export function TtsInput({ value, onChange, onSend, isLoading = false }: TtsInputProps) {
    return (
        <div className="space-y-3">
            <Input
                label="TTS 메시지"
                placeholder="로봇이 말할 문장을 입력하세요"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            <Button variant="secondary" fullWidth onClick={onSend} disabled={!value || isLoading}>
                음성 안내 전송
            </Button>
        </div>
    );
}
