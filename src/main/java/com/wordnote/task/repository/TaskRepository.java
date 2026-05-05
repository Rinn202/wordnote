package com.wordnote.task.repository;

import com.wordnote.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TaskRepository extends JpaRepository<Task, Long> {
    @Query("select coalesce(max(t.sortIndex), 0) from Task t")
    Integer findMaxSortIndex();

}
