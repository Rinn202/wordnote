package com.wordnote.task.service;

import com.wordnote.task.dto.request.TaskPatchDto;
import com.wordnote.task.dto.request.TaskCreateDto;
import com.wordnote.task.dto.response.TaskResponseDto;
import com.wordnote.task.entity.Task;
import com.wordnote.task.mapper.TaskMapper;
import com.wordnote.task.repository.TaskRepository;
import com.wordnote.workbox.mapper.WorkBoxMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final WorkBoxMapper workBoxMapper;

//    public Task findById(Long taskId){
//        return taskRepository.findById(taskId)
//                .orElseThrow(() -> new RuntimeException("WorkBoxMapper not found: " + taskId));
//    }

    public Task findById(long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(EntityNotFoundException::new);
    }

    public List<Task> findByIds(List<Long> taskIds){
        return taskRepository.findAllById(taskIds);
    }

    public TaskResponseDto createTask(TaskCreateDto dto) {
        Integer max = taskRepository.findMaxSortIndex();
        Task task = Task.builder()
                .name(dto.getName())
                .build();

        taskRepository.save(task);

        return taskMapper.toResponseDto(task);
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
