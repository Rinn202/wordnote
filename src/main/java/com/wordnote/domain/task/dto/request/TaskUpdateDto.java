package com.wordnote.domain.task.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class TaskUpdateDto {
    @NotBlank
    private String name;
}