package com.wordnote.workbox.controller;

import com.wordnote.board.entity.Type;
import com.wordnote.workbox.dto.request.WorkBoxPatchDto;
import com.wordnote.workbox.dto.request.WorkBoxPostDto;
import com.wordnote.workbox.dto.response.WorkBoxResponseDto;
import com.wordnote.workbox.mapper.WorkBox;
import com.wordnote.workbox.service.WorkBoxService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/box")
public class WorkBoxController {
    private final WorkBoxService workBoxService;
    private final WorkBox workBoxMapper;

    public WorkBoxController(WorkBoxService workBoxService, WorkBox workBoxMapper) {
        this.workBoxService = workBoxService;
        this.workBoxMapper = workBoxMapper;
    }


    //박스 조회
    @GetMapping("/{boxId}")
    public ResponseEntity<WorkBoxResponseDto> getWorkBoxById(@RequestParam(required = false) Type type,
                                                        @RequestParam(defaultValue = "asc") String sort,
                                                             @PathVariable long boxId) {

        com.wordnote.workbox.entity.WorkBox box = workBoxService.findById(boxId);
        WorkBoxResponseDto response = workBoxMapper.toWorkBoxDto(box);
        return ResponseEntity.ok(response);
    }

    //박스 생성
    @PostMapping
    public ResponseEntity<WorkBoxResponseDto> createWorkBox(@RequestParam(required = false) Type type,
                                                           @RequestBody WorkBoxPostDto workBoxPostDto) {
        //Long memberId = SecurityUtil.getUserId();
        Long memberId = 1L;
        com.wordnote.workbox.entity.WorkBox box = workBoxMapper.postToWorkBox(workBoxPostDto) ;
        com.wordnote.workbox.entity.WorkBox savedBox = workBoxService.createWorkBox(box);
        WorkBoxResponseDto response = workBoxMapper.toWorkBoxDto(savedBox);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping
    public ResponseEntity<WorkBoxResponseDto> patchWorkBox(@RequestParam(required = false) Type type,
                                                           @RequestBody WorkBoxPatchDto workBoxPatchDto) {
        com.wordnote.workbox.entity.WorkBox box = workBoxMapper.patchToWorkBox(workBoxPatchDto) ;
        com.wordnote.workbox.entity.WorkBox savedBox = workBoxService.createWorkBox(box);
        WorkBoxResponseDto response = workBoxMapper.toWorkBoxDto(savedBox);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //박스 삭제
    @DeleteMapping("/{boxId}")
    public ResponseEntity<WorkBoxResponseDto> deleteWorkBox(@RequestParam(required = false) Type type,
                                                       @PathVariable long boxId) {
        workBoxService.deleteWorkBox(boxId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
