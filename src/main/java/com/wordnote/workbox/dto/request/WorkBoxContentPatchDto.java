package com.wordnote.workbox.dto.request;

import com.wordnote.board.entity.Board;
import com.wordnote.task.entity.Task;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkBoxContentPatchDto {

    private Long BoxId;

    private Board board;

    private Task task;

    private LocalDateTime createdAt;
}