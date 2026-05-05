package com.wordnote.board.controller;

import com.wordnote.board.dto.request.BoardPatchDto;
import com.wordnote.board.dto.request.BoardCreateDto;
import com.wordnote.board.dto.response.BoardResponseDto;
import com.wordnote.board.entity.Type;
import com.wordnote.board.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/board")
class BoardController {


    private final BoardService boardService;

    //조회
    @GetMapping
    public ResponseEntity<List<BoardResponseDto>> getAllBoard(@RequestParam(required = false) Type type,
                                                              @RequestParam(defaultValue = "asc") String sort) {
        //Long memberId = SecurityUtil.getUserId();
        long memberId = 1L;

        List<BoardResponseDto> response = boardService.findAll(memberId);

        return ResponseEntity.ok(response);
    }


    //개별 조회
    @GetMapping("/{boardId}")
    public ResponseEntity<BoardResponseDto> getBoard(@RequestParam(required = false) Type type,
                                                     @RequestParam(defaultValue = "asc") String sort,
                                                     @PathVariable long boardId) {
        //Long memberId = SecurityUtil.getUserId();
        long memberId = 1L;

        BoardResponseDto response = boardService.findBoardById(memberId, boardId);
        return ResponseEntity.ok(response);
    }

    //생성
    @PostMapping
    public ResponseEntity<BoardResponseDto> createBoard(@RequestBody BoardCreateDto boardCreateDto) {
        //Long memberId = SecurityUtil.getUserId();
        long memberId = 1L;

        BoardResponseDto response = boardService.createBoard(memberId, boardCreateDto);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //수정
    @PatchMapping("/{boardId}")
    public ResponseEntity<BoardResponseDto> patchBoard(@RequestBody BoardPatchDto boardPatchDto,
                                                       @PathVariable long boardId) {
        //Long memberId = SecurityUtil.getUserId();
        long memberId = 1L;

        BoardResponseDto response = boardService.patchBoard(memberId, boardId, boardPatchDto);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //삭제
    @DeleteMapping("/{boardId}")
    public ResponseEntity<BoardResponseDto> deleteBoard(@PathVariable long boardId) {
        //Long memberId = SecurityUtil.getUserId();
        long memberId = 1L;
        boardService.deleteBoard(boardId, memberId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping
    public ResponseEntity<BoardResponseDto> deleteAllBoard() {

        //Long memberId = SecurityUtil.getUserId();
        long memberId = 1L;
        boardService.deleteAllBoard(memberId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}