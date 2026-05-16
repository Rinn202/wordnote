package com.wordnote.domain.boxtask.repository;

import com.wordnote.domain.boxtask.entity.BoxTask;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoxTaskRepository extends JpaRepository<BoxTask, Long> {
}
