package com.wordnote.workbox.service;

import com.wordnote.workbox.entity.WorkBox;
import com.wordnote.workbox.repository.WorkBoxRepository;
import org.springframework.stereotype.Service;

@Service
public class WorkBoxService {
    WorkBoxRepository workBoxRepository;

    public WorkBox findById(Long boxId) {
        return workBoxRepository.findById(boxId)
                .orElseThrow(() -> new RuntimeException("WorkBoxMapper not found: " + boxId));
    }

    public WorkBox createWorkBox(WorkBox box) {
        return workBoxRepository.save(box);
    }

    public void deleteWorkBox(Long boxId) {
        workBoxRepository.deleteById(boxId);
    }
}
