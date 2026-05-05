package com.wordnote.board.dto.request;

import com.wordnote.board.entity.Type;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class BoardCreateDto {
    private long boardId;
    private Type type;
    private List<Long> boxIds;
}