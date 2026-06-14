import {useEffect} from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import AuthGate from './src/pages/AuthGate';
import OAuthRedirect from './src/pages/OAuthRedirect';
import AdminPage from './src/pages/AdminPage';
import './src/styles/index.css';

declare global { //전역 재정의
    interface Window {
        activeRequestsCount?: number; //→ number 또는 undefined 정의된 전역(window타입) 변수 생성
    }
}
// 요청 처리 전 이탈 방지용
export default function App() { // 기본 출력 함수 정의
    const navigate = useNavigate();

    useEffect(() => {       // BeforeUnloadEvent 타입의 e를 받는 함수를 handleBeforeUnload에 대입
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {  //undefined면 0, 0보다 크면 요청 처리 중
            if ((window.activeRequestsCount || 0) > 0) {
                e.preventDefault(); // 브라우저 기본 동작(그냥 닫기) 막기
                e.returnValue = ''; // 경고창 띄우기
            }
        };

        // beforeunload 이벤트(창 닫기/새로고침 직전)에 위에 정의한 함수 등록
        window.addEventListener('beforeunload', handleBeforeUnload);
        // 뒷정리: 컴포넌트 사라질 때 이벤트 리스너 제거
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []); // 빈 배열: 처음 한 번만 실행

    return (
        <Routes>
            <Route path="/login/redirect" element={<OAuthRedirect/>}/>
            <Route path="/notice" element={<AdminPage onBack={() => navigate(-1)}/>}/> {/*뒤로가기*/}
            <Route path="/*" element={<AuthGate/>}/>
        </Routes>
    );
}