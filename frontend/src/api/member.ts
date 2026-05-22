import { api, req } from './client';
import type { LoginRequest, LoginResponse, Member, RefreshResponse } from '../types';

// 인증 및 회원 관련 API
export const memberApi = {
    login: async (body: LoginRequest): Promise<LoginResponse> => {
        const res = await api.post<LoginResponse>('/auth/login', body);
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('nickname', res.data.nickname);
        return res.data;
    },
    refresh: async (): Promise<RefreshResponse> => {
        const res = await api.post<RefreshResponse>('/auth/refresh');
        localStorage.setItem('accessToken', res.data.accessToken);
        return res.data;
    },
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('nickname');
    },
    signup: (body: unknown) => req<Member>('POST', '/member/signup', body),       // 회원가입
    mypage: () => req<Member>('GET', '/member/mypage'),                           // 마이페이지 조회
    getAll: () => req<Member[]>('GET', '/member'),                                // 전체 회원 조회
    update: (body: unknown) => req<Member>('PATCH', '/member', body),             // 회원 정보 수정
    updatePassword: (password: string) => req<void>('PATCH', '/member/password', { password }), // 비밀번호 변경
    withdraw: () => req<void>('DELETE', '/member'),                               // 회원 탈퇴
};