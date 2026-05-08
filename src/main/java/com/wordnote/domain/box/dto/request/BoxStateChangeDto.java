package com.wordnote.domain.box.dto.request;

import com.wordnote.domain.box.entity.State;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class BoxStateChangeDto {
    private State state;
}
