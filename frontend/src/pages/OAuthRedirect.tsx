import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    email: string;
    memberId: number;
    role: string;
}

export default function OAuthRedirect() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access_token');

        if (accessToken) {
            const decoded = jwtDecode<JwtPayload>(accessToken);
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('role', decoded.role);
            window.location.replace('/');
        } else {
            window.location.replace('/login');
        }
    }, []);

    return null;
}