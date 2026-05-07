package com.wordnote.domain.task.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class TaskCreateDto {

    @NotBlank
    private String name;
}