package com.wordnote.domain.board.repository;

import com.wordnote.domain.board.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long> {

    Optional<Board> findByBoardIdAndMember_MemberId(long boardId, long memberId);

    @Query("SELECT b FROM Board b LEFT JOIN FETCH b.boxes bx " +
            "WHERE b.boardId = :boardId AND b.member.memberId = :memberId " +
            "ORDER BY bx.sortIndex ASC")
    Optional<Board> findBoardWithBoxes(long boardId, long memberId);

    List<Board> findByMember_MemberId(long memberId);
}
