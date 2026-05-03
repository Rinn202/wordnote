package com.wordnote.task.repository;

import com.wordnote.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    Task findByBoxId(long boxId);

}
