package com.wordnote.board.service;

import ch.qos.logback.classic.spi.IThrowableProxy;
import com.wordnote.board.dto.request.BoardPatchDto;
import com.wordnote.board.dto.request.BoardCreateDto;
import com.wordnote.board.dto.response.BoardResponseDto;
import com.wordnote.board.entity.Board;
import com.wordnote.board.mapper.BoardMapper;
import com.wordnote.board.repository.BoardRepository;
import com.wordnote.member.entity.Member;
import com.wordnote.member.service.MemberService;
import com.wordnote.workbox.entity.WorkBox;
import com.wordnote.workbox.repository.WorkBoxRepository;
import com.wordnote.workbox.service.WorkBoxService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class BoardService {
    private final BoardRepository boardRepository;
    private final MemberService memberService;
    private final BoardMapper boardMapper;
    private final WorkBoxRepository workBoxRepository;

    //생성
    @Transactional
    public BoardResponseDto createBoard(long memberId, BoardCreateDto dto) {
        Member member = memberService.findById(memberId);

        Board board = boardMapper.toBoard(dto);
        board.assignMember(member);

        boardRepository.save(board);

        return boardMapper.toResponseDto(board);
    }

    //전체 검색
    public List<BoardResponseDto> findAll(long memberId) {
        List<Board> foundBoards = boardRepository.findByMember_MemberId(memberId);

        return boardMapper.toResponseDtos(foundBoards);
    }

    //단일 검색
    public BoardResponseDto findBoardById(long memberId, long boardId) {
        Board foundBoard = boardRepository.findByBoardIdAndMember_MemberId(boardId, memberId)
                .orElseThrow(() -> new EntityNotFoundException("보드 없음"));

        return boardMapper.toResponseDto(foundBoard);
    }

    //수정
    @Transactional
    public BoardResponseDto patchBoard(long memberId, long boardId, BoardPatchDto dto) {
        Board board = boardRepository.findByBoardIdAndMember_MemberId(boardId, memberId)
                .orElseThrow(() -> new EntityNotFoundException("보드 없음")); //기존 보드

        board.update(dto.getType()); //타입변경

        return boardMapper.toResponseDto(board);
    }

    //전체 삭제
    public void deleteAllBoard(long memberId) {
        List<Board> boardList = boardRepository.findByMember_MemberId(memberId);
        boardRepository.deleteAll(boardList);
    }

    //단일 삭제
    public void deleteBoard(long memberId, long boardId) {

        Board board = boardRepository.findByBoardIdAndMember_MemberId(boardId, memberId)
                .orElseThrow(() -> new EntityNotFoundException("보드 없음"));
        boardRepository.delete(board);
    }

}
