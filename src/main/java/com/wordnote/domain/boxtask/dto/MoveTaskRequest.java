package com.wordnote.domain.boxtask.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MoveTaskRequest {

    private Long boxId;

    private Integer targetIndex;
}