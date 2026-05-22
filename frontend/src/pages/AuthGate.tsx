import {useState} from 'react';
import Login from './Login';
import SignUp from './SignUp';
import BoardApp from './BoardApp';
import {memberApi} from '../api';

export default function AuthGate() {
    const [page, setPage] = useState<string>(
        localStorage.getItem('accessToken') ? 'board' : 'login'
    );

    const handleLogout = () => {
        memberApi.logout();
        setPage('login');
    };

    if (page === 'login') return <Login onSuccess={() => setPage('board')} onGoSignUp={() => setPage('signup')}/>;
    if (page === 'signup') return <SignUp onSuccess={() => setPage('login')} onGoLogin={() => setPage('login')}/>;
    return <BoardApp onLogout={handleLogout}/>;
}