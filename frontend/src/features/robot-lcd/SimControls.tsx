type RobotMode = 'IDLE' | 'GREETING' | 'MEDICATION' | 'SCHEDULE' | 'LISTENING' | 'EMERGENCY' | 'SLEEP';
type RobotEmotion = 'neutral' | 'happy' | 'angry' | 'surprised' | 'sleep' | 'suspicious';

export interface RobotState {
    mode: RobotMode;
    emotion: RobotEmotion;
    message?: string;
    subMessage?: string;
}

export interface SimControlsProps {
    isPreview?: boolean;
    onScenarioChange: (state: RobotState) => void;
    onLogout?: () => void;
}

interface ScenarioButtonProps {
    label: string;
    onClick: () => void;
    danger?: boolean;
}

const SCENARIOS: Array<{ label: string; state: RobotState; danger?: boolean }> = [
    {
        label: '1. 대기',
        state: { mode: 'IDLE', emotion: 'neutral', message: '', subMessage: '' },
    },
    {
        label: '2. 인사',
        state: {
            mode: 'GREETING',
            emotion: 'happy',
            message: '"할머니~ 잘 주무셨어요?\n오늘 날씨가 참 좋아요!"',
            subMessage: '오늘 날씨: 맑음',
        },
    },
    {
        label: '3. 복약',
        state: {
            mode: 'MEDICATION',
            emotion: 'neutral',
            message: '"할머니~ 약 드실 시간이에요!"',
            subMessage: '아침약 (고혈압, 당뇨)',
        },
    },
    {
        label: '4. 일정',
        state: {
            mode: 'SCHEDULE',
            emotion: 'surprised',
            message: '"잊지 마세요!\n곧 병원에 가셔야 해요."',
            subMessage: '오후 2:00 서울대병원 내과',
        },
    },
    {
        label: '5. 듣기',
        state: {
            mode: 'LISTENING',
            emotion: 'happy',
            message: '"네, 듣고 있어요...\n말씀해 주세요!"',
        },
    },
    {
        label: '6. 긴급',
        state: {
            mode: 'EMERGENCY',
            emotion: 'surprised',
            message: '낙상이 감지되었습니다!\n괜찮으신가요?!',
        },
        danger: true,
    },
    {
        label: '7. 충전',
        state: {
            mode: 'SLEEP',
            emotion: 'sleep',
            message: '"저 충전하고 올게요...\n안녕히 주무세요"',
            subMessage: '배터리 충전 중 (75%)',
        },
    },
];

const ScenarioButton = ({ label, onClick, danger }: ScenarioButtonProps) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all text-left
      ${
          danger
              ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
      }
    `}
    >
        {label}
    </button>
);

const SimControls = ({ isPreview = false, onScenarioChange, onLogout }: SimControlsProps) => {
    if (isPreview) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-700 p-3 z-50 overflow-x-auto">
            <div className="flex space-x-2 min-w-max justify-center px-4">
                {SCENARIOS.map((scenario) => (
                    <ScenarioButton
                        key={scenario.label}
                        label={scenario.label}
                        onClick={() => onScenarioChange(scenario.state)}
                        danger={scenario.danger}
                    />
                ))}
                <div className="w-px h-8 bg-gray-700 mx-2" />
                {onLogout && (
                    <button
                        onClick={onLogout}
                        className="px-3 py-2.5 min-h-[48px] rounded-lg text-xs font-bold bg-gray-800 text-red-400 border border-red-900/50"
                    >
                        종료
                    </button>
                )}
            </div>
        </div>
    );
};

export default SimControls;
