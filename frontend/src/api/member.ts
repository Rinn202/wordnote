import {api, req} from './client';
import type {LoginRequest, LoginResponse, Member, RefreshResponse} from '../types';

// 인증 및 회원 관련 API
export const memberApi = {
    //로그인 로직
    login: async (body: LoginRequest): Promise<LoginResponse> => { //응답 데이터 타입 : LoginResponse
        const res = await api.post<LoginResponse>('/auth/login', body); // body로 API 호출 후 <응답 객체> 수신
        localStorage.setItem('accessToken', res.data.accessToken); //토큰 추출
        localStorage.setItem('nickname', res.data.nickname); //닉네임 추출
        return res.data;
    },

    //리프레시 토큰 처리 로직
    refresh: async (): Promise<RefreshResponse> => {
        const res = await api.post<RefreshResponse>('/auth/refresh');
        localStorage.setItem('accessToken', res.data.accessToken);
        return res.data;
    },

    //로그아웃 로직, 로컬 스토리지 청소
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