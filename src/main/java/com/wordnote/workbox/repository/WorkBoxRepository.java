package com.wordnote.workbox.repository;

import com.wordnote.task.entity.Task;
import com.wordnote.workbox.entity.WorkBox;
import org.springframework.data.jpa.repository.JpaRepository;


public interface WorkBoxRepository extends JpaRepository<WorkBox, Long> {
}
