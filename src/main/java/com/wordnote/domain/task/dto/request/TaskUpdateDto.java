package com.wordnote.domain.task.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class TaskUpdateDto {
    @NotBlank
    private String name;

    @NotNull
    private Integer sortIndex;
}