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
    //로그인: 토큰 여부만 확인
    const [page, setPage] = useState<string>(
        localStorage.getItem('accessToken') ? 'menu' : 'login'
    );

    //로그아웃시 보드 Persistence id 삭제, 로그인 페이지로
    const handleLogout = () => {
        memberApi.logout();
        localStorage.removeItem('lastBoardId');
        setPage('login');
    };
    //로그인 페이지: 성공 -> 메뉴, 회원가입 -> 회원가입페이지
    if (page === 'login') return <Login onSuccess={() => setPage('menu')} onGoSignUp={() => setPage('signup')}/>;
    //회원가입 페이지: 성공 -> 로그인페이지, 돌아가기 -> 로그인페이지
    if (page === 'signup') return <SignUp onSuccess={() => setPage('login')} onGoLogin={() => setPage('login')}/>;
    //메뉴: 보드, 마이페이지, 도구, info
    if (page === 'menu') return <MenuPage onNavigate={(p) => setPage(p)} />;
    //보드 페이지: 로그아웃, 메뉴, 마이페이지, 관리자 페이지
    if (page === 'board') return <BoardApp
        onLogout={handleLogout}
        onMenu={() => setPage('menu')}
        onMyPage={() => setPage('mypage')}
        onAdmin={() => setPage('admin')}
    />;

    if (page === 'admin') return <AdminPage onBack={() => setPage('board')} />;
    //마이페이지: 돌아가기, 회원탈퇴-> 로그인페이지
    if (page === 'mypage') return <MyPage onBack={() => setPage('menu')} onWithdraw={() => setPage('login')} />;
    if (page === 'about') return <AboutPage onBack={() => setPage('menu')} />;
    if (page === 'tools') return <ToolsPage onBack={() => setPage('menu')} />;

    return null;
}