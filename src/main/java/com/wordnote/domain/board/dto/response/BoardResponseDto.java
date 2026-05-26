package com.wordnote.domain.board.dto.response;

import com.wordnote.domain.box.dto.response.BoxResponseDto;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@Getter
public class BoardResponseDto {
    private Long boardId;
    private List<BoxResponseDto> boxes;
    private LocalDateTime createdAt;
}
