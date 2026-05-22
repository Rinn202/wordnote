package com.wordnote.domain.board.dto.request;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class BoardCreateDto {
    private long boardId;
    private List<Long> boxIds;
}