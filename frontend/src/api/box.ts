import {req} from './client';
import type {Box, CreateBoxRequest, PatchBoxOptionRequest, PatchBoxStateRequest} from '../types';

export const boxApi = {
    create: (body: CreateBoxRequest) => req<Box>('POST', '/box', body),
    getById: (id: number) => req<Box>('GET', `/box/${id}`),
    patchState: (id: number, body: PatchBoxStateRequest) => req<Box>('PATCH', `/box/${id}/state`, body),
    patchOption: (id: number, body: PatchBoxOptionRequest) => req<Box>('PATCH', `/box/${id}/option`, body),
    delete: (id: number) => req<void>('DELETE', `/box/${id}`),
};