package com.wordnote.member.controller;

import com.wordnote.member.dto.request.MemberPatchDto;
import com.wordnote.member.dto.request.MemberCreateDto;
import com.wordnote.member.dto.response.MemberResponseDto;
import com.wordnote.member.entity.Member;
import com.wordnote.member.mapper.MemberMapper;
import com.wordnote.member.service.MemberService;
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

    private final MemberMapper memberMapper;
    private final MemberService memberService;


    //전체 조회
    @GetMapping
    public ResponseEntity<List<MemberResponseDto>> getAllMember() {

        List<Member> memberList = memberService.findAll();
        List<MemberResponseDto> response = memberMapper.toResponseDto(memberList);
        return ResponseEntity.ok(response);
    }


    //개별 조회
    @GetMapping("/mypage")
    public ResponseEntity<MemberResponseDto> getMember() {
        //Long memberId = SecurityUtil.getUserId();
        long memberId = 1L;

        Member member = memberService.findById(memberId);
        MemberResponseDto response = memberMapper.toResponseDto(member);
        return ResponseEntity.ok(response);
    }

    //생성
    @PostMapping
    public ResponseEntity<MemberResponseDto> createMember(@RequestBody MemberCreateDto memberCreateDto) {

        Member member = memberMapper.CreateToMember(memberCreateDto);
        Member savedMember = memberService.createMember(member);
        MemberResponseDto response = memberMapper.toResponseDto(savedMember);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //수정
    @PatchMapping
    public ResponseEntity<MemberResponseDto> patchMember(@RequestBody MemberPatchDto memberPatchDto) {
        //Long memberId = SecurityUtil.getUserId();
        long memberId = 1L;

        Member member = memberMapper.PatchToMember(memberPatchDto);
        Member savedMember = memberService.patchMember(memberId, member);
        MemberResponseDto response = memberMapper.toResponseDto(savedMember);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //삭제
    @DeleteMapping
    public ResponseEntity<MemberResponseDto> deleteMember() {

        //Long memberId = SecurityUtil.getUserId();
        long memberId = 1L;

        memberService.deleteMember(memberId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}