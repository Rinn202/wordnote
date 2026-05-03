package com.wordnote.task.dto.response;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TaskResponseDto {

    @NotBlank
    private String name;

    @NotNull
    private Long workBoxId;
}
