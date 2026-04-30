package com.wordnote.workbox.repository;

import com.wordnote.workblock.entity.WorkBlock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkBoxRepository extends JpaRepository<WorkBlock, Long> {
}
