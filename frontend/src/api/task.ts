import {req} from './client';
import type {MoveBoxTaskRequest, Task} from '../types';

export const taskApi = {
    getAll: () => req<Task[]>('GET', '/task'),
    create: (name: string) => req<Task>('POST', '/task', {name}),
    update: (id: number, name: string) => req<Task>('PATCH', `/task/${id}`, {name}),
    delete: (id: number) => req<void>('DELETE', `/task/${id}`),
    done: (boxTaskId: number) => req<void>('PATCH', `/boxTask/${boxTaskId}/done`),
    move: (boxTaskId: number, body: MoveBoxTaskRequest) =>
        req<void>('PUT', `/boxTask/${boxTaskId}/move`, body),
};