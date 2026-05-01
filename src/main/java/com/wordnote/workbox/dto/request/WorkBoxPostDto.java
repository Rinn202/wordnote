package com.wordnote.workbox.dto.request;

import com.wordnote.boxlist.entity.BoxList;
import com.wordnote.workblock.entity.WorkBlock;
import com.wordnote.workbox.entity.Status;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class WorkBoxPostDto {

    private Long workBoxId;

    private BoxList boxList;

    private Status status;

    private Boolean bookmark;

    private WorkBlock block;

    private Long alarmId;

    private LocalDateTime alarmTime;

    private LocalDateTime expiredAt;

    private LocalDateTime createdAt;

}
