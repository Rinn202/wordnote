package com.wordnote.domain.box.repository;

import com.wordnote.domain.box.entity.Box;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;


public interface BoxRepository extends JpaRepository<Box, Long> {

    @Query("select coalesce(max(w.sortIndex), 0) from Box w")
    Integer findMaxSortIndex(); //max

    //단일 검색
    Optional<Box> findByBoxIdAndBoard_Member_MemberId(Long boxId, Long memberId);

    //단일 삭제
    void deleteByBoxIdAndBoard_Member_MemberId(Long boxId, Long memberId);

    List<Box> findByBoard_Member_MemberId(long memberId);

    @Query("SELECT b FROM Box b " +
            "WHERE b.boxId = :boxId AND b.board.boardId = :boardId " +
            "ORDER BY b.sortIndex")
    Optional<Box> findByIdAndBoardId_IndexAsc(Long boxId, long boardId);
}
