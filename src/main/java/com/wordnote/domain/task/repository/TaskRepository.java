package com.wordnote.domain.task.repository;

import com.wordnote.domain.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
}
