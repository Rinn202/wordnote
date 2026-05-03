package com.wordnote.board.mapper;

import com.wordnote.board.dto.request.BoardPatchDto;
import com.wordnote.board.dto.request.BoardPostDto;
import com.wordnote.board.dto.response.BoardResponseDto;
import com.wordnote.board.entity.Board;
import com.wordnote.member.entity.Member;
import com.wordnote.member.service.MemberService;
import com.wordnote.workbox.mapper.WorkBox;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class BoardMapper {

    private final WorkBox workBoxMapper;
    public final MemberService memberService;

    public BoardResponseDto toResponseDto(Board board) {
        if (board == null) return null;

        return BoardResponseDto.builder()
                .boardId(board.getBoardId())
                .type(board.getType())
                .sortIndex(board.getSortIndex())
                .boxes(
                        board.getBoxes() == null || board.getBoxes().isEmpty()
                                ? List.of()
                                : board.getBoxes().stream()
                                  .map(workBoxMapper::toWorkBoxDto)
                                  .toList()
                )
                .build();
    }

    public List<BoardResponseDto> toResponseDto(List<Board> boardList) {
        if (boardList == null) return List.of();

        return boardList.stream()
                .map(this::toResponseDto)
                .toList();
    }

    public Board PatchToBoard(long memberId, BoardPatchDto boardPatchToDto) {
        Board board = Board.builder()
                .type(boardPatchToDto.getType())
                .sortIndex(boardPatchToDto.getSortIndex())
                .member(memberService.findById(memberId))
                .build();

        if (boardPatchToDto.getBoxes() != null) {
            boardPatchToDto.getBoxes().stream()
                    .map(workBoxMapper::patchToWorkBox)
                    .forEach(board::addBox);
        }
        return board;
    }

    public Board PostToBoard(long memberId, BoardPostDto boardPostToDto) {

        Member member = memberService.findById(memberId);

        Board board = Board.builder()
                .type(boardPostToDto.getType())
                .sortIndex(boardPostToDto.getSortIndex())
                .member(member)
                .build();

        if (boardPostToDto.getBoxes() != null) {
            boardPostToDto.getBoxes().stream()
                    .map(workBoxMapper::postToWorkBox)
                    .forEach(board::addBox);
        }
        return board;
    }
}