package com.wordnote.domain.workbox.dto.response;

import com.wordnote.domain.task.dto.response.TaskResponseDto;
import com.wordnote.domain.workbox.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class WorkBoxResponseDto {
    private Long boxId;

    private Status status;

    private List<TaskResponseDto> tasks;

    private Boolean bookmark;

    private Integer sortIndex;

    private LocalDateTime alarmTime;

    private LocalDateTime expiredAt;

    private LocalDateTime createdAt;
}
