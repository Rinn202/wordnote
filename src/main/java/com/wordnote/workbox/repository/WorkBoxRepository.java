package com.wordnote.workbox.repository;

import com.wordnote.workbox.entity.WorkBox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;


public interface WorkBoxRepository extends JpaRepository<WorkBox, Long> {
    //sortIndex
    @Query("select coalesce(max(w.sortIndex), 0) from WorkBox w")
    Integer findMaxSortIndex();

    List<WorkBox> findByBoxIdIn(Collection<Long> boxIds);
}
