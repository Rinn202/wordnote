package com.wordnote.domain.workbox.dto.request;

import com.wordnote.domain.board.entity.Board;
import com.wordnote.domain.task.entity.Task;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkBoxContentUpdateDto {

    private Long BoxId;

    private Board board;

    private List<Task> tasks;

    private LocalDateTime createdAt;
}