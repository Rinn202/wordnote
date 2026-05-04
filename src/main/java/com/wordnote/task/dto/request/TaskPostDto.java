package com.wordnote.task.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class TaskPostDto {

    @NotBlank
    private String name;
}