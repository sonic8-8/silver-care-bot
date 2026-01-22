import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5분
            retry: 1,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <div className="min-h-screen bg-gray-50 font-sans">
                    <main className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <h1 className="text-display text-gray-900 mb-4">
                                🤖 안심 가디언
                            </h1>
                            <p className="text-body text-gray-500">
                                AI 반려로봇 보호자 웹앱
                            </p>
                            <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
                                <p className="text-h3 text-gray-700 mb-2">
                                    ✅ 프로젝트 설정 완료
                                </p>
                                <ul className="text-caption text-gray-500 space-y-1">
                                    <li>• React 19 + TypeScript</li>
                                    <li>• Tailwind CSS v3</li>
                                    <li>• React Router v7</li>
                                    <li>• TanStack Query v5</li>
                                    <li>• Zustand v5</li>
                                    <li>• Vitest + Playwright</li>
                                    <li>• MSW 2.x</li>
                                </ul>
                            </div>
                        </div>
                    </main>
                </div>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
