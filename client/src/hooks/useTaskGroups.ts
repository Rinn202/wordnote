/**
 * 태스크 그룹 관리 훅 (프론트 전용, localStorage 저장)
 * 태스크에 그룹명을 붙여 카테고리 탭으로 분류
 */
import { useState, useEffect } from 'react';

export interface TaskGroup {
  id: string;
  name: string;
  taskIds: number[];
}

const STORAGE_KEY = 'wn_task_groups';

export function useTaskGroups() {
  const [groups, setGroups] = useState<TaskGroup[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

  const addGroup = (name: string) => {
    const id = `grp_${Date.now()}`;
    setGroups(g => [...g, { id, name, taskIds: [] }]);
    return id;
  };

  const removeGroup = (id: string) => {
    setGroups(g => g.filter(gr => gr.id !== id));
  };

  const addTaskToGroup = (groupId: string, taskId: number) => {
    setGroups(g => g.map(gr =>
      gr.id === groupId && !gr.taskIds.includes(taskId)
        ? { ...gr, taskIds: [...gr.taskIds, taskId] }
        : gr
    ));
  };

  const removeTaskFromGroup = (taskId: number) => {
    setGroups(g => g.map(gr => ({ ...gr, taskIds: gr.taskIds.filter(id => id !== taskId) })));
  };

  const getGroupForTask = (taskId: number): TaskGroup | undefined => {
    return groups.find(g => g.taskIds.includes(taskId));
  };

  return { groups, addGroup, removeGroup, addTaskToGroup, removeTaskFromGroup, getGroupForTask };
}
