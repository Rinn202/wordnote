package com.wordnote.workbox.dto.response;

import com.wordnote.board.entity.Board;
import com.wordnote.task.entity.Task;
import com.wordnote.workbox.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class WorkBoxContentResponseDto {

    private Long BoxId;

    private Board board;

    private Task task;

    private LocalDateTime createdAt;
}
