package com.wordnote.domain.workbox.repository;

import com.wordnote.domain.workbox.entity.WorkBox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;


public interface WorkBoxRepository extends JpaRepository<WorkBox, Long> {

    @Query("select coalesce(max(w.sortIndex), 0) from WorkBox w")
    Integer findMaxSortIndex(); //max

    //단일 검색
    Optional<WorkBox> findByBoxIdAndBoard_Member_MemberId(Long boxId, Long memberId);

    //단일 삭제
    void deleteByBoxIdAndBoard_Member_MemberId(Long boxId, Long memberId);

    List<WorkBox> findByBoard_Member_MemberId(long memberId);
}
