package com.wordnote.domain.board.repository;

import com.wordnote.domain.board.entity.Board;
import com.wordnote.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long> {

    Optional<Board> findByBoardIdAndMember_MemberId(long boardId, long memberId);

    List<Board> findByMember_MemberId(long memberId);

    @Query("SELECT b FROM Board b " +
            "WHERE b.member.memberId = :memberId " +
            "AND (:currentBoardId IS NULL OR b.boardId != :currentBoardId)")
    long countByMember(Member member);

    Optional<Board> findByMemberIsNull();

    List<Board> findBoardsByMember_MemberId(Long memberMemberId);
}
