package com.wordnote.boxlist.repository;

import com.wordnote.workblock.entity.WorkBlock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListRepository extends JpaRepository<WorkBlock, Long> {
}
