// 전역 요청/응답 정책, 공통 통신 설정 파일
import axios, {type AxiosInstance} from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''; //값이 없어도 proxy 사용되도록

export const api: AxiosInstance = axios.create({ //AxiosInstance 타입, api요청
    baseURL: BASE_URL,
    withCredentials: true, //쿠키 허용
});

// 요청 시 accessToken 헤더 자동 첨부, request 직전, config 사용하여 함수실행
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken'); //스토리지에 있는 토큰 사용
    if (token) config.headers.Authorization = `Bearer ${token}`; //토큰 값이 있으면 헤더에 추가
    return config;
});

//response 401/403 시 토큰 제거 후 로그인 페이지로 이동
api.interceptors.response.use(
    response => response, //성공
    error => { //실패
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('nickname');
            window.location.replace('/'); //window.location(현주소)를 root로 교체 -> AuthGate 매핑 -> 토큰 재검사
        }
        return Promise.reject(error); //api요청 실패 반환
    }
);

export const req
    = <T>(method: string, path: string, body?: unknown): Promise<T> => //req(method, path, body) -> response<T>
    api.request<T>({method, url: path, data: body})
        .then(r => r.data); //response에서 header, status빼고 data만 추출