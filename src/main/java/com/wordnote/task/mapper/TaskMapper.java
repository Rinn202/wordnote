package com.wordnote.task.mapper;

import com.wordnote.task.dto.request.TaskPatchDto;
import com.wordnote.task.dto.request.TaskPostDto;
import com.wordnote.task.dto.response.TaskResponseDto;
import com.wordnote.task.entity.Task;

import java.util.List;

public class TaskMapper {
    //task -> dto
    public TaskResponseDto toResponseDto(Task task) {

        return TaskResponseDto.builder()
                .name(task.getName())
                .workBoxId(task.getTaskId())
                .build();
    }

}
