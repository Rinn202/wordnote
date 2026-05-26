import {useState} from 'react';
import {memberApi} from '../api';
import Login from './Login';
import SignUp from './SignUp';
import BoardApp from './BoardApp';
import MenuPage from './MenuPage';
import MyPage from "./MyPage.tsx";
import AboutPage from './AboutPage';
import ToolsPage from './Toolspage.tsx';
import AdminPage from "./AdminPage.tsx";

export default function AuthGate() {
    const [page, setPage] = useState<string>(
        localStorage.getItem('accessToken') ? 'menu' : 'login'
    );

    const handleLogout = () => {
        memberApi.logout();
        localStorage.removeItem('lastBoardId');
        setPage('login');
    };

    if (page === 'login') return <Login onSuccess={() => setPage('menu')} onGoSignUp={() => setPage('signup')}/>;
    if (page === 'signup') return <SignUp onSuccess={() => setPage('login')} onGoLogin={() => setPage('login')}/>;
    if (page === 'menu') return <MenuPage onNavigate={(p) => setPage(p)} />;

    if (page === 'board') return <BoardApp
        onLogout={handleLogout}
        onMenu={() => setPage('menu')}
        onMyPage={() => setPage('mypage')}
        onAdmin={() => setPage('admin')}
    />;

    if (page === 'admin') return <AdminPage onBack={() => setPage('board')} />;

    if (page === 'mypage') return <MyPage onBack={() => setPage('menu')} onWithdraw={() => setPage('login')} />;
    if (page === 'about') return <AboutPage onBack={() => setPage('menu')} />;
    if (page === 'tools') return <ToolsPage onBack={() => setPage('menu')} />;

    return null;
}