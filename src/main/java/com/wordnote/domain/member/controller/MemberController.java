package com.wordnote.domain.member.controller;

import com.wordnote.auth.utils.SecurityUtil;
import com.wordnote.domain.member.dto.request.MemberCreateDto;
import com.wordnote.domain.member.dto.request.MemberUpdateDto;
import com.wordnote.domain.member.dto.request.PasswordRequest;
import com.wordnote.domain.member.dto.response.MemberResponseDto;
import com.wordnote.domain.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/member")
public class MemberController {

    private final MemberService memberService;


    //전체 조회
    @GetMapping
    public ResponseEntity<List<MemberResponseDto>> getAllMember() {

        List<MemberResponseDto> response = memberService.findAll();
        return ResponseEntity.ok(response);
    }


    //개별 조회
    @GetMapping("/mypage")
    public ResponseEntity<MemberResponseDto> getMember() {
        long memberId = SecurityUtil.getMemberId();

        MemberResponseDto response = memberService.findMember(memberId);
        return ResponseEntity.ok(response);
    }

    //생성
    @PostMapping("/signup")
    public ResponseEntity<MemberResponseDto> createMember(@RequestBody MemberCreateDto dto) {

        MemberResponseDto response = memberService.createMember(dto);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //수정
    @PatchMapping
    public ResponseEntity<MemberResponseDto> patchMember(@RequestBody MemberUpdateDto dto) {
        long memberId = SecurityUtil.getMemberId();

        MemberResponseDto response = memberService.updateMember(dto, memberId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping("/password")
    public ResponseEntity<MemberResponseDto> patchPassword(@RequestBody PasswordRequest dto) {
        long memberId = SecurityUtil.getMemberId();

        memberService.updatePassword(dto, memberId);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    //삭제
    @DeleteMapping
    public ResponseEntity<MemberResponseDto> deleteMember() {

        long memberId = SecurityUtil.getMemberId();

        memberService.deleteMember(memberId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}