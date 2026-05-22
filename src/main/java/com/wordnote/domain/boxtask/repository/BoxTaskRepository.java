package com.wordnote.domain.boxtask.repository;

import com.wordnote.domain.board.entity.Board;
import com.wordnote.domain.box.entity.Box;
import com.wordnote.domain.boxtask.entity.BoxTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BoxTaskRepository extends JpaRepository<BoxTask, Long> {

    // changeDone용 - 전체 다 로딩 대신 COUNT만
    long countByBox(Box box);

    long countByBoxAndIsDone(Box box, boolean isDone);

    // changeIndex용 - 벌크 UPDATE
    @Modifying
    @Query("UPDATE BoxTask t SET t.sortIndex = :sortIndex WHERE t.boxTaskId = :id")
    void updateSortIndex(@Param("id") Long id, @Param("sortIndex") int sortIndex);

    // changeIndex용 - box의 task를 sortIndex 순으로 id, sortIndex만 가져오기
    @Query("SELECT t.boxTaskId FROM BoxTask t WHERE t.box = :box ORDER BY t.sortIndex ASC")
    List<Long> findIdsByBoxOrderBySortIndex(@Param("box") Box box);

    // changeState용 벌크 UPDATE
    @Modifying
    @Query("UPDATE BoxTask t SET t.isDone = :isDone WHERE t.box = :box")
    void updateAllDoneByBox(@Param("box") Box box, @Param("isDone") boolean isDone);

    @Modifying
    @Query("UPDATE BoxTask t SET t.isDone = false WHERE t.box IN " +
            "(SELECT b FROM Box b WHERE b.board = :board)")
    void resetAllDoneByBoard(@Param("board") Board board);
}