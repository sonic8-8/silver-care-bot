import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';
import RobotLCD from '@/features/robot-lcd/RobotLCD';

function RobotLCDScreen() {
    return (
        <GuardianAppContainer title="LCD 미러링" description="로봇 LCD 화면을 확인합니다.">
            <div className="w-full rounded-3xl border border-gray-200 bg-gray-900 p-3">
                <div className="mx-auto aspect-[1024/600] w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-700 bg-black">
                    <RobotLCD isPreview />
                </div>
            </div>
        </GuardianAppContainer>
    );
}

export default RobotLCDScreen;
