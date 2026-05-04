package com.wordnote.task.mapper;

import com.wordnote.task.dto.response.TaskResponseDto;
import com.wordnote.task.entity.Task;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TaskMapper {
    //task -> dto
    public TaskResponseDto toResponseDto(Task task) {

        return TaskResponseDto.builder()
                .taskId(task.getTaskId())
                .name(task.getName())
                .sortIndex(task.getSortIndex())
                .build();
    }

    public List<TaskResponseDto> toResponseDtos(List<Task> tasks) {

        return tasks.stream()
                .map(this::toResponseDto)
                .toList();
    }

}
