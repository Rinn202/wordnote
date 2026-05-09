package com.wordnote.domain.box.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoxTaskMoveRequest {
    private Long boxTaskId;
    private Integer targetIndex;
}