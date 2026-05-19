import {useEffect} from 'react';

export default function OAuthRedirect() {

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access_token');

        if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            // navigate 대신 하드 이동 → useState 초기값 새로 실행됨
            window.location.replace('/');
        } else {
            window.location.replace('/login');
        }
    }, []);

    return null;
}