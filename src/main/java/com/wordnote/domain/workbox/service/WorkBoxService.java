package com.wordnote.domain.workbox.service;

import com.wordnote.domain.board.entity.Board;
import com.wordnote.domain.board.repository.BoardRepository;
import com.wordnote.domain.task.entity.Task;
import com.wordnote.domain.task.service.TaskService;
import com.wordnote.domain.workbox.dto.request.WorkBoxCreateDto;
import com.wordnote.domain.workbox.dto.request.WorkBoxOptionUpdateDto;
import com.wordnote.domain.workbox.dto.response.WorkBoxResponseDto;
import com.wordnote.domain.workbox.entity.Status;
import com.wordnote.domain.workbox.entity.WorkBox;
import com.wordnote.domain.workbox.mapper.WorkBoxMapper;
import com.wordnote.domain.workbox.repository.WorkBoxRepository;
import com.wordnote.domain.workboxtask.WorkBoxTask;
import com.wordnote.domain.workboxtask.WorkBoxTaskRepository;
import com.wordnote.exception.ExceptionCode;
import com.wordnote.exception.LogicException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class WorkBoxService {
    private final WorkBoxRepository workBoxRepository;
    private final WorkBoxMapper workBoxMapper;
    private final TaskService taskService;
    private final BoardRepository boardRepository;
    private final WorkBoxTaskRepository workBoxTaskRepository;

    //박스생성
    @Transactional
    public WorkBoxResponseDto createWorkBox(WorkBoxCreateDto dto, long memberId) {

        Integer max = workBoxRepository.findMaxSortIndex(); //sort

        Board board = boardRepository // 보드 조회
                .findByBoardIdAndMember_MemberId(dto.getBoardId(), memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.BOARD_NOT_FOUND));

        WorkBox box = WorkBox.builder().sortIndex(max + 1).build();  // 새 WorkBox 생성
        box.setBoard(board);       // 박스 - 보드 연결
        WorkBox savedBox = workBoxRepository.save(box); // 매핑된 박스(PK 생성 + FK 기준 확보)

        List<Task> tasks = taskService.findByIds(dto.getTaskIds()); // 연결할 Task
        List<WorkBoxTask> relations = new ArrayList<>(); //join 테이블

        int index = 1;

        for (Task task : tasks) {   //각 task마다 연결

            WorkBoxTask relation = new WorkBoxTask();

            relation.setWorkBox(savedBox); // join - box
            relation.setTask(task); // join - task
            relation.setSortIndex(index++);
            relations.add(relation);
        }
        workBoxTaskRepository.saveAll(relations);
        savedBox.setWorkBoxTasks(relations);    // box - join

        return workBoxMapper.toBoxResponseDto(savedBox);
    }

    //옵션변경
    @Transactional
    public WorkBoxResponseDto changeOption(long boxId, WorkBoxOptionUpdateDto request, long memberId) {
        WorkBox foundBox = workBoxRepository.findByBoxIdAndBoard_Member_MemberId(boxId, memberId) //타겟검색
                .orElseThrow(() -> new LogicException(ExceptionCode.BOX_NOT_FOUND));

        WorkBox updateBox = workBoxMapper.patchToWorkBoxOption(request, foundBox); //덮어쓰기
        workBoxRepository.save(updateBox);

        return workBoxMapper.toBoxResponseDto(updateBox);
    }

    //상태변경
    @Transactional
    public WorkBoxResponseDto changeStatus(long boxId, Status next, long memberId) {

        WorkBox box = workBoxRepository.findByBoxIdAndBoard_Member_MemberId(boxId, memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.BOX_NOT_FOUND));
        box.changeStatus(next);
        workBoxRepository.save(box);

        return workBoxMapper.toBoxResponseDto(box);
    }

    //검색
    public WorkBoxResponseDto findById(long boxId, long memberId) {
        WorkBox box = workBoxRepository.findByBoxIdAndBoard_Member_MemberId(boxId, memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.BOX_NOT_FOUND));
        return workBoxMapper.toBoxResponseDto(box);
    }

    //삭제
    @Transactional
    public void deleteWorkBox(long boxId, long memberId) {
        workBoxRepository.deleteByBoxIdAndBoard_Member_MemberId(boxId, memberId);
    }

    public List<WorkBoxResponseDto> findByMemberId(long memberId) {
        List<WorkBox> boxes = workBoxRepository.findByBoard_Member_MemberId(memberId);
        if (boxes.isEmpty()) throw new LogicException(ExceptionCode.BOX_NOT_FOUND);

        return workBoxMapper.toBoxesResponseDtos(boxes);
    }
}
