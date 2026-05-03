package com.wordnote.task.service;

import com.wordnote.task.dto.request.TaskPatchDto;
import com.wordnote.task.dto.request.TaskPostDto;
import com.wordnote.task.entity.Task;
import com.wordnote.task.repository.TaskRepository;
import com.wordnote.workbox.service.WorkBoxService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class TaskService {
    TaskRepository taskRepository;
    WorkBoxService workBoxService;

    public Task findById(Long taskId){
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("WorkBoxMapper not found: " + taskId));
    }

    public Task findByWorKBoxId(long boxId) {
        return taskRepository.findByBox_BoxId(boxId);
    }

    public Task createTask(TaskPostDto task) {
        Task createTask = Task.builder()
                .name(task.getName())
                .box(workBoxService.findById(task.getBoxId()))
                .build();

        return taskRepository.save(createTask);
    }

    public Task updateTask(long taskId, TaskPatchDto patchDto) {
        Task foundTask = taskRepository.findById(taskId)
                .orElseThrow(EntityNotFoundException::new);

        foundTask.update(
                patchDto.getName(),
                workBoxService.findById(patchDto.getWorkBoxId()));

        return foundTask;
    }

    public void deleteTask(long taskId) {
        taskRepository.deleteById(taskId);
    }
}
