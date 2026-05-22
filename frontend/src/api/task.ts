import {req} from './client';
import type {MoveBoxTaskRequest, Task} from '../types';

// 태스크 관련 API
export const taskApi = {
    getAll: () => req<Task[]>('GET', '/task'),
    create: (name: string, category?: string, info?: string | undefined) =>
        req<Task>('POST', '/task', {name, category: category ?? 'custom', info}),
    update: (id: number, name: string, category?: string) =>
        req<Task>('PATCH', `/task/${id}`, {name, category}),
    delete: (id: number) => req<void>('DELETE', `/task/${id}`),
    done: (boxTaskId: number) => req<void>('PATCH', `/boxTask/${boxTaskId}/done`),
    move: (boxTaskId: number, body: MoveBoxTaskRequest) =>
        req<void>('PUT', `/boxTask/${boxTaskId}/move`, body),
}