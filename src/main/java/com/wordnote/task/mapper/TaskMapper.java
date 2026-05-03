package com.wordnote.task.mapper;

import com.wordnote.task.dto.response.TaskResponseDto;
import com.wordnote.task.entity.Task;

public class TaskMapper {
    //task -> dto
    public TaskResponseDto toResponseDto(Task task) {

        return TaskResponseDto.builder()
                .name(task.getName())
                .workBoxId(task.getTaskId())
                .build();
    }

}
