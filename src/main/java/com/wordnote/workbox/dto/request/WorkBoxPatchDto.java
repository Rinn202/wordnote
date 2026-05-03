package com.wordnote.workbox.dto.request;

import com.wordnote.board.entity.Board;
import com.wordnote.task.entity.Task;
import com.wordnote.workbox.entity.Status;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class WorkBoxPatchDto {

    private Long BoxId;

    private Board board;

    private Status status;

    private Boolean bookmark;

    private Task task;

    private Long alarmId;

    private LocalDateTime alarmTime;

    private LocalDateTime expiredAt;

    private LocalDateTime createdAt;
}
