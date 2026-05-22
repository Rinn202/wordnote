import {api, req} from './client';
import type {LoginRequest, LoginResponse, Member, RefreshResponse} from '../types';

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
    signup: (body: unknown) => req<Member>('POST', '/member/signup', body),
    mypage: () => req<Member>('GET', '/member/mypage'),
    getAll: () => req<Member[]>('GET', '/member'),
    update: (body: unknown) => req<Member>('PATCH', '/member', body),
    updatePassword: (password: string) => req<void>('PATCH', '/member/password', {password}),
    withdraw: () => req<void>('DELETE', '/member'),
};