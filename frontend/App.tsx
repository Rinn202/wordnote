import {Route, Routes} from 'react-router-dom';
import AuthGate from './src/pages/AuthGate';
import OAuthRedirect from './src/pages/OAuthRedirect';
import MyPage from './src/pages/MyPage';
import './index.css';

export default function App() {
    return (
        <Routes>
            <Route path="/oauth2/redirect" element={<OAuthRedirect/>}/>
            <Route path="/member/mypage" element={<MyPage/>}/>
            <Route path="/*" element={<AuthGate/>}/>
        </Routes>
    );
}