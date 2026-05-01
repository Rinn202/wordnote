package com.wordnote.boxlist.service;

import com.wordnote.boxlist.dto.request.ListPostDto;
import com.wordnote.workbox.entity.WorkBox;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ListService {
    public List<WorkBox> findAll() {
    }

    public List<WorkBox> findByMemberId(Long memberId) {
    }

    public List<WorkBox> createWorkList(Long memberId, List<WorkBox> list) {
    }
}
