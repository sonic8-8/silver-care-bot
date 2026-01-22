import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// MSW 개발 환경 설정 (선택적)
async function enableMocking() {
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
        const { worker } = await import('./mocks/browser');
        return worker.start({
            onUnhandledRequest: 'bypass',
        });
    }
    return Promise.resolve();
}

enableMocking().then(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
});
