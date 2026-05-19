import {req} from './client';
import type {Board, ReorderBoxRequest} from '../types';

export const boardApi = {
    create: () => req<Board>('POST', '/board'),
    getAll: (currentBoardId: number) => req<Board[]>('GET', `/board?currentBoardId=${currentBoardId}`),
    getById: (id: number) => req<Board>('GET', `/board/${id}`),
    update: (id: number, body: Partial<Board>) => req<Board>('PATCH', `/board/${id}`, body),
    reset: (id: number) => req<void>('PUT', `/board/${id}/reset`),
    delete: (id: number) => req<void>('DELETE', `/board/${id}`),
    reorderBox: (boardId: number, body: ReorderBoxRequest) =>
        req<void>('PUT', `/board/${boardId}/boxesOrder`, body),
};