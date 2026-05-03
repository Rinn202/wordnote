package com.wordnote.board.dto.response;

import com.wordnote.board.entity.Type;
import com.wordnote.workbox.dto.response.WorkBoxResponseDto;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Builder
@Getter
public class BoardResponseDto {
    private Long boardId;
    private Type type;
    private Integer sortIndex;
    private List<WorkBoxResponseDto> boxes;


    public BoardResponseDto(List<BoardResponseDto> list) {
    }
}
