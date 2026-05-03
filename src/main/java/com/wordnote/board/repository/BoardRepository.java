package com.wordnote.board.repository;

import com.wordnote.board.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {

    Board findByBoardIdAndMember_MemberId(Long memberId, long boardId);

    List<Board> findByMember_MemberId(long memberId);
}
