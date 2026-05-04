package com.wordnote.task.service;

import com.wordnote.task.dto.request.TaskPatchDto;
import com.wordnote.task.dto.request.TaskPostDto;
import com.wordnote.task.entity.Task;
import com.wordnote.task.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class TaskService {
    private final TaskRepository taskRepository;

//    public Task findById(Long taskId){
//        return taskRepository.findById(taskId)
//                .orElseThrow(() -> new RuntimeException("WorkBoxMapper not found: " + taskId));
//    }

    public Task findById(long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException());
    }

    public Task createTask(TaskPostDto task) {
        Integer max = taskRepository.findMaxSortIndex();
        Task createTask = Task.builder()
                .name(task.getName())
                .sortIndex(max + 1)
                .build();

        return taskRepository.save(createTask);
    }

    public Task updateTask(long taskId, TaskPatchDto patchDto) {
        Task foundTask = taskRepository.findById(taskId)
                .orElseThrow(EntityNotFoundException::new);

        foundTask.update(
                patchDto.getName(),
                patchDto.getSortIndex());

        return taskRepository.save(foundTask);
    }

    public void deleteTask(long taskId) {
        taskRepository.deleteById(taskId);
    }
}
