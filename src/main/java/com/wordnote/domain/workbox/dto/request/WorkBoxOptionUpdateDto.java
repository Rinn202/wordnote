package com.wordnote.domain.workbox.dto.request;

import com.wordnote.domain.workbox.entity.Status;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkBoxOptionUpdateDto {
    private Status status;

    private Long BoxId;

    private Boolean bookmark;

    private Integer sortIndex;

    private LocalDateTime alarmTime;

    private LocalDateTime expiredAt;

}