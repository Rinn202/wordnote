import {useEffect} from 'react';
import {Route, Routes} from 'react-router-dom';
import AuthGate from './src/pages/AuthGate';
import OAuthRedirect from './src/pages/OAuthRedirect';
import AdminPage from './src/pages/AdminPage';
import './src/styles/index.css';

declare global {
    interface Window {
        activeRequestsCount?: number;
    }
}
// 요청 처리 전 이탈 방지용
export default function App() {
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if ((window.activeRequestsCount || 0) > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    return (
        <Routes>
            <Route path="/login/redirect" element={<OAuthRedirect/>}/>
            <Route path="/notice" element={<AdminPage/>}/>
            <Route path="/*" element={<AuthGate/>}/>
        </Routes>
    );
}