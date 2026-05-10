package com.wordnote.domain.task.service;

import com.wordnote.domain.task.dto.request.TaskCreateDto;
import com.wordnote.domain.task.dto.request.TaskUpdateDto;
import com.wordnote.domain.task.dto.response.TaskResponseDto;
import com.wordnote.domain.task.entity.Task;
import com.wordnote.domain.task.mapper.TaskMapper;
import com.wordnote.domain.task.repository.TaskRepository;
import com.wordnote.exception.ExceptionCode;
import com.wordnote.exception.LogicException;
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

    public TaskResponseDto findById(long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(EntityNotFoundException::new);
        return taskMapper.toResponseDto(task);
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
    public TaskResponseDto updateTask(long taskId, TaskUpdateDto patchDto) {
        Task foundTask = taskRepository.findById(taskId)
                .orElseThrow(() -> new LogicException(ExceptionCode.TASK_NOT_FOUND));

        foundTask.update(patchDto.getName());

        return taskMapper.toResponseDto(foundTask);
    }


    @Transactional
    public void deleteTask(long taskId) {
        taskRepository.deleteById(taskId);
    }

    public List<TaskResponseDto> findAll() {
        List<Task> tasks = taskRepository.findAll();
        return taskMapper.toResponseDtos(tasks);
    }
}
