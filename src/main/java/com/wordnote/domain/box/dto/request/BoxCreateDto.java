package com.wordnote.domain.box.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class BoxCreateDto {

    private long boardId;

    private List<Long> taskIds;
}