package com.wordnote.domain.boxtask;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoxTaskRepository extends JpaRepository<BoxTask, Long> {
    List<BoxTask> findByBox_BoxIdOrderBySortIndexAsc(Long boxId);
}
