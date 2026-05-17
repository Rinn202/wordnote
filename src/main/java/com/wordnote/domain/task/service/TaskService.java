package com.wordnote.domain.task.service;

import com.wordnote.domain.task.dto.request.TaskCreateDto;
import com.wordnote.domain.task.dto.request.TaskUpdateDto;
import com.wordnote.domain.task.dto.response.TaskResponseDto;
import com.wordnote.domain.task.entity.Task;
import com.wordnote.domain.task.mapper.TaskMapper;
import com.wordnote.domain.task.repository.TaskRepository;
import com.wordnote.exception.ExceptionCode;
import com.wordnote.exception.LogicException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    //박스 생성시 task조회용
    public List<Task> findByIds(List<Long> taskIds) {
        return taskRepository.findAllById(taskIds);
    }

    //전체 조회(공용 + 개인)
    public List<TaskResponseDto> findAllByMemberId(long memberId) {
        List<Task> tasks = taskRepository.findAllByMemberId(memberId);
        return taskMapper.toResponseDtos(tasks);
    }

    //생성
    @Transactional
    public TaskResponseDto createTask(TaskCreateDto dto, long memberId) {
        Task task = new Task(memberId, dto.getName());

        taskRepository.save(task);

        return taskMapper.toResponseDto(task);
    }

    //수정
    @Transactional
    public TaskResponseDto updateTask(long taskId, TaskUpdateDto patchDto, long memberId) {
        Task foundTask = taskRepository.findByIdAndMemberId(taskId, memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.TASK_NOT_FOUND));

        foundTask.update(patchDto.getName());

        return taskMapper.toResponseDto(foundTask);
    }

    //삭제
    @Transactional
    public void deleteTask(long taskId, long memberId) {
        taskRepository.deleteById(taskId, memberId);
    }
}
