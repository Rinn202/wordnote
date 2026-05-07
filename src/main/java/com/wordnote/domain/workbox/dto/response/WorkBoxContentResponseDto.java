package com.wordnote.domain.workbox.dto.response;

import com.wordnote.domain.board.entity.Board;
import com.wordnote.domain.task.entity.Task;
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
