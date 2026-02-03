import GuardianAppContainer from '@/pages/_components/GuardianAppContainer';

function RobotLCDScreen() {
    return (
        <GuardianAppContainer title="LCD 미러링" description="로봇 LCD 화면을 확인합니다.">
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
                LCD 미러링 화면 영역
            </div>
        </GuardianAppContainer>
    );
}

export default RobotLCDScreen;
