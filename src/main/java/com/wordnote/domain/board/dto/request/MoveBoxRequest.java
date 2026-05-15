package com.wordnote.domain.board.dto.request;

import lombok.Getter;

@Getter
public class MoveBoxRequest {
    private Long boxId;

    private Integer targetIndex;
}
