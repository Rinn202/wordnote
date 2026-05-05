package com.wordnote.task.service;

import com.wordnote.task.dto.request.TaskCreateDto;
import com.wordnote.task.dto.request.TaskUpdateDto;
import com.wordnote.task.dto.response.TaskResponseDto;
import com.wordnote.task.entity.Task;
import com.wordnote.task.mapper.TaskMapper;
import com.wordnote.task.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public Task findById(long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(EntityNotFoundException::new);
    }

    public List<Task> findByIds(List<Long> taskIds) {
        return taskRepository.findAllById(taskIds);
    }

    @Transactional
    public TaskResponseDto createTask(TaskCreateDto dto) {
        Task task = Task.builder()
                .name(dto.getName())
                .build();

        taskRepository.save(task);

        return taskMapper.toResponseDto(task);
    }

    @Transactional
    public Task updateTask(long taskId, TaskUpdateDto patchDto) {
        Task foundTask = taskRepository.findById(taskId)
                .orElseThrow(EntityNotFoundException::new);

        foundTask.update(patchDto.getName());

        return taskRepository.save(foundTask);
    }

    @Transactional
    public void deleteTask(long taskId) {
        taskRepository.deleteById(taskId);
    }
}
