package com.wordnote.task.dto.response;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TaskResponseDto {
    private Long taskId;

    private String name;

    private Integer sortIndex;
}
