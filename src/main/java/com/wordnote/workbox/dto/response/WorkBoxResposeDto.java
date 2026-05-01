package com.wordnote.workbox.dto.response;

import com.wordnote.boxlist.entity.BoxList;
import com.wordnote.workblock.entity.WorkBlock;
import com.wordnote.workbox.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class WorkBoxResposeDto {
    private Long workBoxId;

    private Status status;

    private WorkBlock block;

    private Long alarmId;

    private Boolean bookmark;

    private LocalDateTime alarmTime;

    private LocalDateTime expiredAt;

    private LocalDateTime createdAt;
}
