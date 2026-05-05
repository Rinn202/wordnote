package com.wordnote.board.repository;

import com.wordnote.board.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long> {

    Optional<Board> findByBoardIdAndMember_MemberId(long boardId, long memberId);

    List<Board> findByMember_MemberId(long memberId);
}
