package com.wordnote.domain.workbox.controller;

import com.wordnote.auth.utils.SecurityUtil;
import com.wordnote.domain.workbox.dto.request.WorkBoxCreateDto;
import com.wordnote.domain.workbox.dto.request.WorkBoxOptionUpdateDto;
import com.wordnote.domain.workbox.dto.response.WorkBoxResponseDto;
import com.wordnote.domain.workbox.service.WorkBoxService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/box")
public class WorkBoxController {
    private final WorkBoxService workBoxService;

    //박스 조회
    @GetMapping("/{boxId}")
    public ResponseEntity<WorkBoxResponseDto> getWorkBoxById(@PathVariable long boxId) {
        long memberId = SecurityUtil.getMemberId();
        WorkBoxResponseDto response = workBoxService.findById(boxId, memberId);
        return ResponseEntity.ok(response);
    }

    //박스 생성
    @PostMapping
    public ResponseEntity<WorkBoxResponseDto> createWorkBox(@RequestBody WorkBoxCreateDto dto) {
        long memberId = SecurityUtil.getMemberId();
        WorkBoxResponseDto response = workBoxService.createWorkBox(dto, memberId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //옵션 변경
    @PatchMapping("/option/{boxId}")
    public ResponseEntity<WorkBoxResponseDto> patchWorkBoxOption(@RequestBody WorkBoxOptionUpdateDto optionDto,
                                                                 @PathVariable long boxId) {
        long memberId = SecurityUtil.getMemberId();
        WorkBoxResponseDto response = workBoxService.changeOption(boxId, optionDto, memberId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    //상태변경
    @PatchMapping("/state/{boxId}")
    public ResponseEntity<WorkBoxResponseDto> patchWorkBoxState(@RequestBody WorkBoxOptionUpdateDto optionDto,
                                                                @PathVariable long boxId) {
        long memberId = SecurityUtil.getMemberId();
        WorkBoxResponseDto response = workBoxService.changeStatus(boxId, optionDto.getStatus(), memberId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //박스 삭제
    @DeleteMapping("/{boxId}")
    public ResponseEntity<WorkBoxResponseDto> deleteWorkBox(@PathVariable long boxId) {
        long memberId = SecurityUtil.getMemberId();
        workBoxService.deleteWorkBox(boxId, memberId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping
    public ResponseEntity<List<WorkBoxResponseDto>> getWorkBoxById() {
        long memberId = SecurityUtil.getMemberId();

        List<WorkBoxResponseDto> response = workBoxService.findByMemberId(memberId);

        return ResponseEntity.ok(response);
    }
}
