package com.wordnote.workbox.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class WorkBoxCreateDto {

    private long boardId;

    private List<Long> taskIds;
}