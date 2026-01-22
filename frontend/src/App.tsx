import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Playground from './pages/Playground';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
        },
    },
});

function HomePage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <main className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        🤖 안심 가디언
                    </h1>
                    <p className="text-gray-500 mb-8">
                        AI 반려로봇 보호자 웹앱
                    </p>
                    <Link
                        to="/playground"
                        className="inline-block bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
                    >
                        🎨 Playground로 이동
                    </Link>
                </div>
            </main>
        </div>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/playground" element={<Playground />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
