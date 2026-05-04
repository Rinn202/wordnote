package com.wordnote.board.dto.request;

import com.wordnote.board.entity.Type;
import com.wordnote.workbox.dto.request.WorkBoxPostDto;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class BoardPostDto {
    private Type type;
    private Long memberId;
    private List<WorkBoxPostDto> boxes;
}