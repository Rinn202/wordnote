package com.wordnote.board.dto.request;

import com.wordnote.board.entity.Type;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class BoardUpdateDto {
    private Type type;
    private List<Long> boxIds;
}
