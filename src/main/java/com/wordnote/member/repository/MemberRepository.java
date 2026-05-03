package com.wordnote.member.repository;

import com.wordnote.member.entity.Member;
import com.wordnote.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
}
