import {Route, Routes} from 'react-router-dom';
import AuthGate from './src/pages/AuthGate';
import OAuthRedirect from './src/pages/OAuthRedirect';
import MyPage from './src/pages/MyPage';
import './src/styles/index.css';
import NoticePage from './src/pages/NoticePage';

export default function App() {
    return (
        <Routes>
            <Route path="/oauth2/redirect" element={<OAuthRedirect/>}/>
            <Route path="/member/mypage" element={<MyPage/>}/>
            <Route path="/*" element={<AuthGate/>}/>
            <Route path="/notice" element={<NoticePage />} />
        </Routes>
    );
}