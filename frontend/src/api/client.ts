import axios, {type AxiosInstance} from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const req = <T>(method: string, path: string, body?: unknown): Promise<T> =>
    api.request<T>({method, url: path, data: body}).then(r => r.data);

// 401, 403 에러가 발생하면 토큰을 제거하고 로그인 페이지로 리다이렉트
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('nickname');
            window.location.replace('/');
        }
        return Promise.reject(error);
    }
);