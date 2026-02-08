import { useNavigate, useParams } from 'react-router-dom';
import RobotLCD from '@/features/robot-lcd/RobotLCD';
import { useAuthStore } from '@/features/auth/store/authStore';

function RobotDeviceScreen() {
    const navigate = useNavigate();
    const { robotId } = useParams();
    const logout = useAuthStore((state) => state.logout);

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="text-sm text-white/80">
                    로봇 모드 {robotId ? `#${robotId}` : ''}
                </div>
                <button
                    type="button"
                    className="rounded-md border border-white/20 px-3 py-1 text-sm text-white/80 hover:bg-white/10"
                    onClick={() => {
                        logout();
                        navigate('/login', { replace: true });
                    }}
                >
                    로그아웃
                </button>
            </header>
            <main className="h-[calc(100vh-53px)] w-full">
                <RobotLCD />
            </main>
        </div>
    );
}

export default RobotDeviceScreen;
