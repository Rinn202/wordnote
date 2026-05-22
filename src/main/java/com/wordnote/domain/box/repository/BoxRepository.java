package com.wordnote.domain.box.repository;

import com.wordnote.domain.board.entity.Board;
import com.wordnote.domain.box.entity.Box;
import com.wordnote.domain.box.entity.BoxType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    // BoxRepository
    @Modifying
    @Query("UPDATE Box b SET b.sortIndex = :sortIndex WHERE b.boxId = :id")
    void updateSortIndex(@Param("id") Long id, @Param("sortIndex") int sortIndex);

    @Query("SELECT b.boxId FROM Box b WHERE b.board = :board ORDER BY b.sortIndex ASC")
    List<Long> findIdsByBoardOrderBySortIndex(@Param("board") Board board);

    // BoxRepository 추가
    @Modifying
    @Query("UPDATE Box b SET b.state = 'READY' WHERE b.board = :board")
    void resetStateByBoard(@Param("board") Board board);

    @Modifying
    void deleteByBoardAndBoxType(Board board, BoxType boxType);
}
