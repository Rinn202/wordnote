package com.wordnote.task.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class TaskCreateDto {

    @NotBlank
    private String name;
}