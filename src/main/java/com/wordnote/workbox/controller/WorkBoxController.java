package com.wordnote.workbox.controller;

import com.wordnote.workbox.mapper.WorkBoxMapper;
import com.wordnote.workbox.service.WorkBoxService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/box")
public class WorkBoxController {
    private final WorkBoxService workBoxService;
    private final WorkBoxMapper workBoxMapper;

    public WorkBoxController(WorkBoxService workBoxService, WorkBoxMapper workBoxMapper) {
        this.workBoxService = workBoxService;
        this.workBoxMapper = workBoxMapper;
    }

    //리스트 id 로 box검색





}
