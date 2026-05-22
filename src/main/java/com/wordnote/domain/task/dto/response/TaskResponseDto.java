package com.wordnote.domain.task.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TaskResponseDto {

    private Long taskId;

    private Long memberId;

    private String name;

    private String category;

    private String info;
}
