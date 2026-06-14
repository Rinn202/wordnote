import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from '../App.tsx';
import {BrowserRouter} from 'react-router-dom';

// 엘리먼트 'root' search
const rootElement = document.getElementById('root');

// 없으면 에러
if (!rootElement) {
    throw new Error('최상위 루트 엘리먼트(#root)를 찾을 수 없습니다. index.html을 확인해주세요.');
}

// 렌더링
createRoot(rootElement).render(
    <StrictMode>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </StrictMode>
);

