package com.wordnote.domain.board.service;

import com.wordnote.domain.board.dto.request.BoardUpdateDto;
import com.wordnote.domain.board.dto.request.MoveBoxRequest;
import com.wordnote.domain.board.dto.response.BoardResponseDto;
import com.wordnote.domain.board.entity.Board;
import com.wordnote.domain.board.mapper.BoardMapper;
import com.wordnote.domain.board.repository.BoardRepository;
import com.wordnote.domain.box.entity.Box;
import com.wordnote.domain.box.entity.BoxType;
import com.wordnote.domain.box.repository.BoxRepository;
import com.wordnote.domain.boxtask.entity.BoxTask;
import com.wordnote.domain.member.entity.Member;
import com.wordnote.domain.member.service.MemberService;
import com.wordnote.domain.task.repository.TaskRepository;
import com.wordnote.exception.ExceptionCode;
import com.wordnote.exception.LogicException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class BoardService {
    private final BoardRepository boardRepository;
    private final MemberService memberService;
    private final BoardMapper boardMapper;
    private final BoxRepository boxRepository;


    @Transactional
    public BoardResponseDto copySampleBoard(long boardId, long memberId) {
        //새보드
        Board board = boardRepository.findByBoardIdAndMember_MemberId(boardId, memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.BOARD_NOT_FOUND));
        //샘플보드
        Board template = boardRepository.findByMemberIsNull()
                .orElseThrow(() -> new LogicException(ExceptionCode.SAMPLE_BOARD_NOT_FOUND));

        //박스복제
        template.getBoxes().forEach(box -> {
            Box newBox = Box.builder()
                    .board(board)
                    .name(box.getName())
                    .boxType(box.getBoxType())
                    .sortIndex(box.getSortIndex())
                    .build();
            boxRepository.save(newBox);

            //테스크 복제
            List<BoxTask> boxTasks = box.getBoxTasks() == null ? new ArrayList<>() :
                    box.getBoxTasks().stream()
                    .map(bt -> BoxTask.builder()
                               .box(newBox)
                               .task(bt.getTask())
                               .sortIndex(bt.getSortIndex())
                               .isDone(false)
                               .build())
                    .collect(Collectors.toCollection(ArrayList::new));

            newBox.setBoxTasks(boxTasks);
            boxRepository.save(newBox);
        });

        return boardMapper.toResponseDto(
                boardRepository.findByBoardIdAndMember_MemberId(boardId, memberId).orElseThrow()
        );
    }

    //생성
    @Transactional
    public BoardResponseDto createBoard(long memberId) {
        Member member = memberService.findById(memberId);

        long count = boardRepository.countByMember(member);

        if (count >= 11) {
            throw new LogicException(ExceptionCode.BOARD_COUNT_LIMIT);
        }

        Board board = Board.builder().build();
        board.assignMember(member);

        boardRepository.save(board);

        return boardMapper.toResponseDto(board);
    }

//    @Transactional    //dto를 받는 보드생성
//    public BoardResponseDto createBoard(long memberId, BoardCreateDto dto) {
//        Member member = memberService.findById(memberId);
//
//        Board board = boardMapper.toBoard(dto);
//        board.assignMember(member);
//
//        boardRepository.save(board);
//
//        return boardMapper.toResponseDto(board);
//    }

    //전체 검색
    public List<BoardResponseDto> findAll(long memberId, Long currentBoardId) {
        List<Board> boards = boardRepository.findBoardsByMemberExceptCurrent(memberId, currentBoardId);

        return boardMapper.toResponseDtos(boards);
    }

    //단일 검색
    public BoardResponseDto findBoardById(long boardId, long memberId) {
        Board board = boardRepository.findByBoardIdAndMember_MemberId(boardId, memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.BOARD_NOT_FOUND));

        return boardMapper.toResponseDto(board);
    }

    //수정
    @Transactional
    public BoardResponseDto updateBoard(long boardId, BoardUpdateDto dto, long memberId) {
        Board board = boardRepository.findByBoardIdAndMember_MemberId(boardId, memberId)
                .orElseThrow(() -> new EntityNotFoundException("보드 없음")); //기존 보드

        return boardMapper.toResponseDto(board);
    }

    //전체 삭제
    @Transactional
    public void deleteAllBoard(long memberId) {
        List<Board> boardList = boardRepository.findByMember_MemberId(memberId);
        boardRepository.deleteAll(boardList);
    }

    //단일 삭제
    @Transactional
    public void deleteBoard(long boardId, long memberId) {

        Board board = boardRepository.findByBoardIdAndMember_MemberId(boardId, memberId)
                .orElseThrow(() -> new EntityNotFoundException("보드 없음"));
        boardRepository.delete(board);
    }

    //리셋
    @Transactional
    public void boardReset(long boardId, long memberId) {
        Board board = boardRepository.findByBoardIdAndMember_MemberId(boardId, memberId)
                .orElseThrow(() -> new EntityNotFoundException("보드 없음"));

        board.getBoxes().forEach(box -> {
            box.resetState();                              // 박스 리셋
            box.getBoxTasks().forEach(BoxTask::resetDone); // 태스크 리셋
        });

        board.getBoxes().removeIf(box -> box.getBoxType() == BoxType.EVENT);
    }

    //박스 순서변경
    @Transactional
    public void changeIndex(long boardId, MoveBoxRequest dto, long memberId) {

        Board board = boardRepository.findByBoardIdAndMember_MemberId(boardId, memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.BOARD_NOT_FOUND));

        Box box = boxRepository.findByIdAndBoardId_IndexAsc(dto.getBoxId(), boardId)
                .orElseThrow(() -> new LogicException(ExceptionCode.BOX_NOT_FOUND));

        List<Box> boxes = board.getBoxes();

        if (dto.getTargetIndex() < 0 || dto.getTargetIndex() >= boxes.size()) {
            throw new LogicException(ExceptionCode.INVALID_INDEX);
        }

        boxes.remove(box);
        boxes.add(dto.getTargetIndex(), box);

        //index 재정렬
        for (int i = 0; i < boxes.size(); i++) {
            boxes.get(i).changeIndex(i);
        }
    }
}
