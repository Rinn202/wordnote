package com.wordnote.boxlist.controller;

import com.wordnote.boxlist.dto.request.ListPostDto;
import com.wordnote.boxlist.dto.response.ListResponseDto;
import com.wordnote.boxlist.mapper.ListMapper;
import com.wordnote.boxlist.repository.ListRepository;
import com.wordnote.boxlist.service.ListService;
import com.wordnote.workbox.entity.WorkBox;
import com.wordnote.workbox.mapper.WorkBoxMapper;
import org.apache.catalina.security.SecurityUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.wordnote.boxlist.entity.Type;

import java.util.List;


@Validated
@RestController
@RequestMapping("/workLists")
class ListController {
    private final ListService listService;
    private final ListMapper listMapper;
    private final ListRepository listRepository;
    private final MemberService memberService;
    private final WorkBoxMapper workBoxMapper;

    public ListController(ListService listService, WorkBoxMapper workBoxMapper, ListMapper listMapper, ListRepository listRepository, MemberService memberService, WorkBoxMapper workBoxMapper1) {
        this.listService = listService;
        this.listMapper = listMapper;
        this.listRepository = listRepository;
        this.memberService = memberService;
        this.workBoxMapper = workBoxMapper;
    }

    //리스트 전체조회
    @GetMapping
    public ResponseEntity<ListResponseDto> getWorkLists(@RequestParam(required = false) Type type,
                                                        @RequestParam(defaultValue = "asc") String sort) {
        Long memberId = SecurityUtil.getUserId();//토큰

        List<WorkBox> list = listService.findAll();
        ListResponseDto response = new ListResponseDto(list);
        return ResponseEntity.ok(response);
    }

    //리스트 객체조회
    @GetMapping("workListId")
    public ResponseEntity<ListResponseDto> getWorkListsById(@RequestParam(required = false) Type type,
                                                            @RequestParam(defaultValue = "asc") String sort) {
        Long memberId = SecurityUtil.getUserId();//토큰

        List<WorkBox> list = listService.findByMemberId(memberId);
        ListResponseDto response = new ListResponseDto(list);
        return ResponseEntity.ok(response);
    }

    //리스트 생성
    @PostMapping
    public ResponseEntity<ListResponseDto> createWorkList(@RequestHeader("Authorization") String token,
                                                          @RequestBody ListPostDto listPostDto) {
        Long memberId = SecurityUtil.getUserId();//토큰

        List<WorkBox> workBoxes = listMapper.toWorkBoxes(listPostDto);
        List<WorkBox> savedBoxes  = listService.createWorkList(memberId, workBoxes);
        ListResponseDto response = listMapper.toResponseListDto(savedBoxes);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //리스트 수정

    //리스트 삭제
}