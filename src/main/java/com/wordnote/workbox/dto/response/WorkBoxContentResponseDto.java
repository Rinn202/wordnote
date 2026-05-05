package com.wordnote.workbox.dto.response;

import com.wordnote.board.entity.Board;
import com.wordnote.task.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class WorkBoxContentResponseDto {

    private Long BoxId;

    private Board board;

    private List<Task> tasks;

    private LocalDateTime createdAt;
}
