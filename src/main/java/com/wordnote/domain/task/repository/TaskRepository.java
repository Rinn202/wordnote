package com.wordnote.domain.task.repository;

import com.wordnote.domain.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    // null + memberId 전체
    @Query("SELECT t FROM Task t WHERE t.memberId IS NULL OR t.memberId = :memberId")
    List<Task> findAllByMemberId(@Param("memberId") long memberId);


    // null + memberId 개별 조회
    @Query("SELECT t FROM Task t WHERE t.taskId = :taskId AND (t.memberId IS NULL OR t.memberId = :memberId)")
    Optional<Task> findByIdAndMemberId(@Param("taskId") long taskId, @Param("memberId") long memberId);


    // null + memberId 개별 삭제
    @Modifying
    @Query("DELETE FROM Task t WHERE t.taskId = :taskId AND t.memberId = :memberId")
    void deleteById(@Param("taskId") long taskId, @Param("memberId") long memberId);
}
