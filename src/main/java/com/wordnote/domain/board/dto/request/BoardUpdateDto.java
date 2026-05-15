package com.wordnote.domain.board.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class BoardUpdateDto {
    private List<Long> boxIds;
}
