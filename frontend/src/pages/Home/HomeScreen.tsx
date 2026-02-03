import { Link } from 'react-router-dom';

function HomeScreen() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <main className="flex min-h-screen items-center justify-center px-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        실버 케어 로봇
                    </h1>
                    <p className="mt-3 text-gray-500">AI 반려로봇 보호자 웹앱</p>
                    <Link
                        to="/playground"
                        className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-primary-500 px-6 py-3 text-white transition-colors hover:bg-primary-600"
                    >
                        Playground로 이동
                    </Link>
                </div>
            </main>
        </div>
    );
}

export default HomeScreen;
