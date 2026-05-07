package com.wordnote.domain.board.controller;

import com.wordnote.auth.utils.SecurityUtil;
import com.wordnote.domain.board.dto.request.BoardCreateDto;
import com.wordnote.domain.board.dto.request.BoardUpdateDto;
import com.wordnote.domain.board.dto.response.BoardResponseDto;
import com.wordnote.domain.board.entity.Type;
import com.wordnote.domain.board.service.BoardService;
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
    public ResponseEntity<List<BoardResponseDto>> getAllBoards(@RequestParam(required = false) Type type,
                                                               @RequestParam(defaultValue = "asc") String sort) {
        long memberId = SecurityUtil.getMemberId();

        List<BoardResponseDto> response = boardService.findAll(memberId);

        return ResponseEntity.ok(response);
    }


    //개별 조회
    @GetMapping("/{boardId}")
    public ResponseEntity<BoardResponseDto> getBoard(@RequestParam(required = false) Type type,
                                                     @RequestParam(defaultValue = "asc") String sort,
                                                     @PathVariable long boardId) {
        long memberId = SecurityUtil.getMemberId();

        BoardResponseDto response = boardService.findBoardById(memberId, boardId);
        return ResponseEntity.ok(response);
    }

    //생성
    @PostMapping
    public ResponseEntity<BoardResponseDto> postBoard(@RequestBody BoardCreateDto dto) {

        long memberId = SecurityUtil.getMemberId();

        BoardResponseDto response = boardService.createBoard(memberId, dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //수정
    @PatchMapping("/{boardId}")
    public ResponseEntity<BoardResponseDto> patchBoard(@RequestBody BoardUpdateDto boardUpdateDto,
                                                       @PathVariable long boardId) {
        long memberId = SecurityUtil.getMemberId();

        BoardResponseDto response = boardService.updateBoard(memberId, boardId, boardUpdateDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //삭제
    @DeleteMapping("/{boardId}")
    public ResponseEntity<BoardResponseDto> deleteBoard(@PathVariable long boardId) {

        long memberId = SecurityUtil.getMemberId();

        boardService.deleteBoard(boardId, memberId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping
    public ResponseEntity<BoardResponseDto> deleteAllBoard() {

        long memberId = SecurityUtil.getMemberId();

        boardService.deleteAllBoard(memberId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}