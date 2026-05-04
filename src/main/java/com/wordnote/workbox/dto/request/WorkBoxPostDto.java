package com.wordnote.workbox.dto.request;

import com.wordnote.board.entity.Board;
import com.wordnote.task.entity.Task;
import com.wordnote.workbox.entity.Status;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class WorkBoxPostDto {
    private long taskId;
}