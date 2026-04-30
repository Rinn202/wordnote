package com.wordnote.workblock.repository;

import com.wordnote.workblock.entity.WorkBlock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkBlockRepository extends JpaRepository<WorkBlock, Long> {
}
