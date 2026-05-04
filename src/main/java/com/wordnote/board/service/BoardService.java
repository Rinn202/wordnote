package com.wordnote.board.service;

import com.wordnote.board.entity.Board;
import com.wordnote.board.repository.BoardRepository;
import com.wordnote.member.entity.Member;
import com.wordnote.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class BoardService {
    private final BoardRepository boardRepository;
    private final MemberService memberService;


    //생성
    public Board createBoard(long memberId, Board board) {
        Member member = memberService.findById(memberId);

        Board newBoard = Board.builder()
                .type(board.getType())
                .member(member)
                .boxes(board.getBoxes())
                .build();

        return boardRepository.save(newBoard);
    }

    //전체 검색
    public List<Board> findAll(long memberId) {
        return boardRepository.findByMember_MemberId(memberId);
    }

    //단일 검색
    public Board findById(long memberId, long boardId) {
        return boardRepository.findByBoardIdAndMember_MemberId(memberId, boardId);
    }

    //수정
    public Board patchBoard(long memberId, long boardId, Board board) {
        Board target = boardRepository.findByBoardIdAndMember_MemberId(memberId, boardId);

        target.update(board.getType(), board.getBoxes());
        return target;
    }


    //전체 삭제
    public void deleteAllBoard(long memberId) {
        List<Board> boardList = boardRepository.findByMember_MemberId(memberId);
        boardRepository.deleteAll(boardList);
    }

    //단일 삭제
    public void deleteBoard(long memberId, long boardId) {

        Board board = boardRepository.findByBoardIdAndMember_MemberId(memberId, boardId);
        boardRepository.delete(board);
    }

}
