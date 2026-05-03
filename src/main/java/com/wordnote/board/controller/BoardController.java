package com.wordnote.board.controller;

import com.wordnote.board.dto.request.BoardPatchDto;
import com.wordnote.board.dto.request.BoardPostDto;
import com.wordnote.board.dto.response.BoardResponseDto;
import com.wordnote.board.entity.Board;
import com.wordnote.board.entity.Type;
import com.wordnote.board.mapper.BoardMapper;
import com.wordnote.board.service.BoardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Validated
@RestController
@RequestMapping("/Boards")
class BoardController {

    BoardMapper boardMapper;
    BoardService boardService;

    //조회
    @GetMapping
    public ResponseEntity<List<BoardResponseDto>> getAllBoard(@RequestParam(required = false) Type type,
                                                              @RequestParam(defaultValue = "asc") String sort) {
        //Long memberId = SecurityUtil.getUserId();
        long memberId = 1L;

        List<Board> boardList = boardService.findAll(memberId);
        List<BoardResponseDto> response = boardMapper.toResponseDto(boardList);
        return ResponseEntity.ok(response);
    }


    //개별 조회
    @GetMapping("/{boardId}")
    public ResponseEntity<BoardResponseDto> getBoard(@RequestParam(required = false) Type type,
                                                     @RequestParam(defaultValue = "asc") String sort,
                                                     @PathVariable long boardId) {
        //Long memberId = SecurityUtil.getUserId();
        long memberId = 1L;

        Board board = boardService.findById(memberId, boardId);
        BoardResponseDto response = boardMapper.toResponseDto(board);
        return ResponseEntity.ok(response);
    }

    //생성
    @PostMapping
    public ResponseEntity<BoardResponseDto> createBoard(@RequestParam(required = false) Type type,
                                                        @RequestBody BoardPostDto boardPostDto) {
        //Long memberId = SecurityUtil.getUserId();
        long memberId = 1L;

        Board board = boardMapper.PostToBoard(memberId, boardPostDto);
        Board savedBoard = boardService.createBoard(memberId, board);
        BoardResponseDto response = boardMapper.toResponseDto(savedBoard);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //수정
    @PatchMapping("/{boardId}")
    public ResponseEntity<BoardResponseDto> patchBoard(@RequestParam(required = false) Type type,
                                                       @RequestBody BoardPatchDto boardPatchDto) {
        //Long memberId = SecurityUtil.getUserId();
        long memberId = 1L;

        Board board = boardMapper.PatchToBoard(memberId, boardPatchDto);
        Board savedBoard = boardService.patchBoard(memberId, board);
        BoardResponseDto response = boardMapper.toResponseDto(savedBoard);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //삭제
    @DeleteMapping("/{boardId}")
    public ResponseEntity<BoardResponseDto> deleteBoard(@RequestParam(required = false) Type type,
                                                        @PathVariable long boardId) {
        //Long memberId = SecurityUtil.getUserId();
        long memberId = 1L;
        boardService.deleteBoard(boardId, memberId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}