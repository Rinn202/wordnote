package com.wordnote.domain.box.service;

import com.wordnote.domain.board.entity.Board;
import com.wordnote.domain.board.repository.BoardRepository;
import com.wordnote.domain.box.dto.request.BoxCreateDto;
import com.wordnote.domain.box.dto.request.BoxOptionChangeDto;
import com.wordnote.domain.box.dto.request.BoxTaskMoveRequest;
import com.wordnote.domain.box.dto.response.BoxResponseDto;
import com.wordnote.domain.box.entity.Box;
import com.wordnote.domain.box.entity.State;
import com.wordnote.domain.box.mapper.BoxMapper;
import com.wordnote.domain.box.repository.BoxRepository;
import com.wordnote.domain.boxtask.BoxTask;
import com.wordnote.domain.boxtask.BoxTaskRepository;
import com.wordnote.domain.task.entity.Task;
import com.wordnote.domain.task.service.TaskService;
import com.wordnote.exception.ExceptionCode;
import com.wordnote.exception.LogicException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class BoxService {
    private final BoxRepository boxRepository;
    private final BoxMapper boxMapper;
    private final TaskService taskService;
    private final BoardRepository boardRepository;
    private final BoxTaskRepository boxTaskRepository;

    //박스생성
    @Transactional
    public BoxResponseDto createBox(BoxCreateDto dto, long memberId) {

        Integer max = boxRepository.findMaxSortIndex(); //sort

        Board board = boardRepository // 보드 조회
                .findByBoardIdAndMember_MemberId(dto.getBoardId(), memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.BOARD_NOT_FOUND));

        Box box = Box.builder().sortIndex(max + 1).build();  // 새 Box 생성
        box.setBoard(board);       // 박스 - 보드 연결
        Box savedBox = boxRepository.save(box); // 매핑된 박스(PK 생성 + FK 기준 확보)

        List<Task> tasks = taskService.findByIds(dto.getTaskIds()); // 연결할 Task
        List<BoxTask> relations = new ArrayList<>(); //join 테이블

        int sortIndex = 0;

        for (Task task : tasks) {   //각 task마다 연결

            BoxTask relation = new BoxTask();

            relation.setBox(savedBox); // join - box
            relation.setTask(task); // join - task
            relation.setSortIndex(sortIndex++);
            relations.add(relation);
        }
        boxTaskRepository.saveAll(relations);
        savedBox.setBoxTasks(relations);    // box - join

        return boxMapper.toBoxResponseDto(savedBox);
    }

    //옵션변경
    @Transactional
    public BoxResponseDto changeOption(long boxId, BoxOptionChangeDto request, long memberId) {
        Box foundBox = boxRepository.findByBoxIdAndBoard_Member_MemberId(boxId, memberId) //타겟검색
                .orElseThrow(() -> new LogicException(ExceptionCode.BOX_NOT_FOUND));

        boxMapper.patchToBoxOption(request, foundBox); //덮어쓰기

        return boxMapper.toBoxResponseDto(foundBox);
    }

    //상태변경
    @Transactional
    public BoxResponseDto changeState(long boxId, State requestState, long memberId) {

        Box box = boxRepository.findByBoxIdAndBoard_Member_MemberId(boxId, memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.BOX_NOT_FOUND));
        box.changeState(requestState);
        boxRepository.save(box);

        return boxMapper.toBoxResponseDto(box);
    }

    //검색
    public BoxResponseDto findById(long boxId, long memberId) {
        Box box = boxRepository.findByBoxIdAndBoard_Member_MemberId(boxId, memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.BOX_NOT_FOUND));
        return boxMapper.toBoxResponseDto(box);
    }

    //삭제
    @Transactional
    public void deleteBox(long boxId, long memberId) {
        boxRepository.deleteByBoxIdAndBoard_Member_MemberId(boxId, memberId);
    }

    public List<BoxResponseDto> findByMemberId(long memberId) {
        List<Box> boxes = boxRepository.findByBoard_Member_MemberId(memberId);
        if (boxes.isEmpty()) throw new LogicException(ExceptionCode.BOX_NOT_FOUND);

        return boxMapper.toBoxesResponseDtos(boxes);
    }

    @Transactional
    public void moveTask(Long boxId, BoxTaskMoveRequest request) {
        //박스Id로 tasks 찾기
        List<BoxTask> list = boxTaskRepository.findByBox_BoxIdOrderBySortIndexAsc(boxId);
        //요청 task
        BoxTask target = list.stream()
                .filter(bt -> bt.getBoxTaskId().equals(request.getBoxTaskId()))
                .findFirst()
                .orElseThrow();

        list.remove(target);
        list.add(request.getTargetIndex(), target); //삭제 후 원하는 자리에 끼워넣기

        for (int i = 0; i < list.size(); i++) {
            list.get(i).setSortIndex(i);
        }
    }
}
