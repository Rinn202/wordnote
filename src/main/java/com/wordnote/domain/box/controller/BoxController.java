package com.wordnote.domain.box.controller;

import com.wordnote.auth.utils.SecurityUtil;
import com.wordnote.domain.box.dto.request.BoxCreateDto;
import com.wordnote.domain.box.dto.request.BoxOptionChangeDto;
import com.wordnote.domain.box.dto.request.BoxStateChangeDto;
import com.wordnote.domain.box.dto.response.BoxResponseDto;
import com.wordnote.domain.box.service.BoxService;
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
public class BoxController {
    private final BoxService boxService;

    //박스 조회
    @GetMapping("/{boxId}")
    public ResponseEntity<BoxResponseDto> getBoxById(@PathVariable long boxId) {
        long memberId = SecurityUtil.getMemberId();
        BoxResponseDto response = boxService.findById(boxId, memberId);
        return ResponseEntity.ok(response);
    }

    //박스 생성
    @PostMapping
    public ResponseEntity<BoxResponseDto> createBox(@RequestBody BoxCreateDto dto) {
        long memberId = SecurityUtil.getMemberId();
        BoxResponseDto response = boxService.createBox(dto, memberId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //옵션 변경
    @PatchMapping("/{boxId}/option")
    public ResponseEntity<BoxResponseDto> patchBoxOption(@RequestBody BoxOptionChangeDto dto,
                                                         @PathVariable long boxId) {
        long memberId = SecurityUtil.getMemberId();
        BoxResponseDto response = boxService.changeOption(boxId, dto, memberId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    //상태변경
    @PatchMapping("/{boxId}/state")
    public ResponseEntity<BoxResponseDto> patchBoxState(@RequestBody BoxStateChangeDto dto,
                                                        @PathVariable long boxId) {
        long memberId = SecurityUtil.getMemberId();
        BoxResponseDto response = boxService.changeState(boxId, dto.getState(), memberId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //박스 삭제
    @DeleteMapping("/{boxId}")
    public ResponseEntity<BoxResponseDto> deleteBox(@PathVariable long boxId) {
        long memberId = SecurityUtil.getMemberId();
        boxService.deleteBox(boxId, memberId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping
    public ResponseEntity<List<BoxResponseDto>> getBoxById() {
        long memberId = SecurityUtil.getMemberId();

        List<BoxResponseDto> response = boxService.findByMemberId(memberId);

        return ResponseEntity.ok(response);
    }
}
