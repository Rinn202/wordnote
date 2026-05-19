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