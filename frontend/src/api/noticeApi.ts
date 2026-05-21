import { req } from './client';
import type { Notice } from '../types';

export interface NoticeRequest {
    title?: string;
    content?: string;
}

export const noticeApi = {
    getAll: () => req<Notice[]>('GET', '/notice'),
    get: (noticeId: number) => req<Notice>('GET', `/notice/${noticeId}`),
    create: (body: NoticeRequest) => req<Notice>('POST', '/notice', body),
    update: (noticeId: number, body: NoticeRequest) => req<Notice>('PATCH', `/notice/${noticeId}`, body),
    delete: (noticeId: number) => req<void>('DELETE', `/notice/${noticeId}`),
};