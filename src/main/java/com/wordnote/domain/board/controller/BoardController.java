package com.wordnote.domain.board.controller;

import com.wordnote.auth.utils.SecurityUtil;
import com.wordnote.domain.board.dto.request.BoardUpdateDto;
import com.wordnote.domain.board.dto.request.MoveBoxRequest;
import com.wordnote.domain.board.dto.response.BoardResponseDto;
import com.wordnote.domain.board.service.BoardService;
import com.wordnote.domain.box.dto.response.BoxResponseDto;
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

    //박스인덱스 이동
    @PutMapping("/{boardId}/boxesOrder")
    public ResponseEntity<BoxResponseDto> putBoxIndex(@RequestBody MoveBoxRequest dto,
                                                      @PathVariable long boardId) {
        long memberId = SecurityUtil.getMemberId();
        boardService.changeIndex(boardId, dto, memberId);

        return new ResponseEntity<>(HttpStatus.OK);
    }


    //샘플복제
    @PostMapping("/{boardId}/sample")
    public ResponseEntity<BoardResponseDto> postSampleBoard(@PathVariable long boardId) {

        long memberId = SecurityUtil.getMemberId();

        BoardResponseDto response = boardService.copySampleBoard(boardId, memberId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //생성
    @PostMapping
    public ResponseEntity<BoardResponseDto> postBoard() {

        long memberId = SecurityUtil.getMemberId();

        BoardResponseDto response = boardService.createBoard(memberId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //    //생성 보드 디티오받음
//    @PostMapping
//    public ResponseEntity<BoardResponseDto> postBoard(@RequestBody BoardCreateDto dto) {
//
//        long memberId = SecurityUtil.getMemberId();
//
//        BoardResponseDto response = boardService.createBoard(memberId, dto);
//        return new ResponseEntity<>(response, HttpStatus.CREATED);
//    }

    //조회
    @GetMapping
    public ResponseEntity<List<BoardResponseDto>> getAllBoards(
            @RequestParam(value = "currentBoardId", required = false) Long currentBoardId) {

        long memberId = SecurityUtil.getMemberId();

        List<BoardResponseDto> response = boardService.findAll(memberId, currentBoardId);

        return ResponseEntity.ok(response);
    }

    //개별 조회
    @GetMapping("/{boardId}")
    public ResponseEntity<BoardResponseDto> getBoard(@PathVariable long boardId) {
        long memberId = SecurityUtil.getMemberId();

        BoardResponseDto response = boardService.findBoardById(boardId, memberId);
        return ResponseEntity.ok(response);
    }


    //수정
    @PatchMapping("/{boardId}")
    public ResponseEntity<BoardResponseDto> patchBoard(@RequestBody BoardUpdateDto boardUpdateDto,
                                                       @PathVariable long boardId) {
        long memberId = SecurityUtil.getMemberId();

        BoardResponseDto response = boardService.updateBoard(boardId, boardUpdateDto, memberId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    //보드 리셋(박스 상태 초기화)
    @PutMapping("/{boardId}/reset")
    public ResponseEntity<BoardResponseDto> patchReset(@PathVariable long boardId) {
        long memberId = SecurityUtil.getMemberId();

        boardService.boardReset(boardId, memberId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    //삭제
    @DeleteMapping("/{boardId}")
    public ResponseEntity<BoardResponseDto> deleteBoard(@PathVariable long boardId) {

        long memberId = SecurityUtil.getMemberId();

        boardService.deleteBoard(boardId, memberId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    //전체 삭제
    @DeleteMapping
    public ResponseEntity<BoardResponseDto> deleteAllBoard() {

        long memberId = SecurityUtil.getMemberId();

        boardService.deleteAllBoard(memberId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}