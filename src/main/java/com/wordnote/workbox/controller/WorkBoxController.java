package com.wordnote.workbox.controller;

import com.wordnote.workbox.dto.request.WorkBoxOptionPatchDto;
import com.wordnote.workbox.dto.request.WorkBoxPostDto;
import com.wordnote.workbox.dto.response.WorkBoxContentResponseDto;
import com.wordnote.workbox.dto.response.WorkBoxResponseDto;
import com.wordnote.workbox.entity.WorkBox;
import com.wordnote.workbox.mapper.WorkBoxMapper;
import com.wordnote.workbox.service.WorkBoxService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/box")
public class WorkBoxController {
    private final WorkBoxService workBoxService;
    private final WorkBoxMapper workBoxMapper;

    //박스 조회
    @GetMapping("/{boxId}")
    public ResponseEntity<WorkBoxResponseDto> getWorkBoxById(@PathVariable long boxId) {

        WorkBox box = workBoxService.findById(boxId);
        WorkBoxResponseDto response = workBoxMapper.toWorkBoxDto(box);
        return ResponseEntity.ok(response);
    }

    //박스 생성
    @PostMapping
    public ResponseEntity<WorkBoxResponseDto> createWorkBox(@RequestBody WorkBoxPostDto workBoxPostDto) {
        //Long memberId = SecurityUtil.getUserId();
        Long memberId = 1L;
        WorkBox savedBox = workBoxService.createWorkBox(workBoxPostDto);
        WorkBoxResponseDto response = workBoxMapper.toWorkBoxDto(savedBox);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //테스크 변경
    @PatchMapping("/{boxId}")
    public ResponseEntity<WorkBoxResponseDto> patchWorkBox(@RequestBody WorkBoxContentResponseDto contentDto,
                                                           @PathVariable long boxId) {
        WorkBox savedBox = workBoxService.updateTask(boxId, contentDto);
        WorkBoxResponseDto response = workBoxMapper.toWorkBoxDto(savedBox);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //옵션 변경
    @PatchMapping("/option/{boxId}")
    public ResponseEntity<WorkBoxResponseDto> patchWorkBoxOption(@RequestBody WorkBoxOptionPatchDto optionDto,
                                                           @PathVariable long boxId) {
        WorkBox savedBox = workBoxService.changeOption(boxId, optionDto);
        WorkBoxResponseDto response = workBoxMapper.toWorkBoxDto(savedBox);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    //상태변경
    @PatchMapping("/state/{boxId}")
    public ResponseEntity<WorkBoxResponseDto> patchWorkBoxState(@RequestBody WorkBoxOptionPatchDto optionDto,
                                                              @PathVariable long boxId) {
        WorkBox savedBox = workBoxService.changeStatus(boxId, optionDto.getStatus());
        WorkBoxResponseDto response = workBoxMapper.toWorkBoxDto(savedBox);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //박스 삭제
    @DeleteMapping("/{boxId}")
    public ResponseEntity<WorkBoxResponseDto> deleteWorkBox(@PathVariable long boxId) {
        workBoxService.deleteWorkBox(boxId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
