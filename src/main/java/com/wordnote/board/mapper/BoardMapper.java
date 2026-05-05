package com.wordnote.board.mapper;

import com.wordnote.board.dto.request.BoardCreateDto;
import com.wordnote.board.dto.response.BoardResponseDto;
import com.wordnote.board.entity.Board;
import com.wordnote.workbox.mapper.WorkBoxMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class BoardMapper {

    private final WorkBoxMapper workBoxMapper;

    public BoardResponseDto toResponseDto(Board board) {
        if (board == null) return null;

        return BoardResponseDto.builder()
                .boardId(board.getBoardId())
                .type(board.getType())
                .boxes(
                        board.getBoxes() == null || board.getBoxes().isEmpty()
                                ? List.of()
                                : board.getBoxes().stream()
                                  .map(workBoxMapper::toWorkBoxDto)
                                  .toList()
                )
                .build();
    }

    public List<BoardResponseDto> toResponseDtos(List<Board> boards) {
        if (boards == null) return List.of();

        return boards.stream()
                .map(this::toResponseDto)
                .toList();
    }


    public Board toBoard(BoardCreateDto dto) {

        return Board.builder().type(dto.getType()).build();
    }

}