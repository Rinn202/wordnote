package com.wordnote.workbox.dto.response;

import com.wordnote.task.dto.response.TaskResponseDto;
import com.wordnote.workbox.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class WorkBoxOptionResponseDto {
    private Status status;

    private Long BoxId;

    private Boolean bookmark;

    private Integer sortIndex;

    private LocalDateTime alarmTime;

    private LocalDateTime expiredAt;
}
