package com.wordnote.member.repository;

import com.wordnote.workblock.entity.WorkBlock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<WorkBlock, Long> {
}
