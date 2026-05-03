package com.wordnote.workbox.dto.response;

import com.wordnote.task.entity.Task;
import com.wordnote.workbox.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class WorkBoxResponseDto {
    private Long boxId;

    private Status status;

    private Task task;

    private Long alarmId;

    private Boolean bookmark;

    private LocalDateTime alarmTime;

    private LocalDateTime expiredAt;

    private LocalDateTime createdAt;
}
