package com.wordnote.workbox.service;

import com.wordnote.board.entity.Board;
import com.wordnote.board.repository.BoardRepository;
import com.wordnote.task.entity.Task;
import com.wordnote.task.service.TaskService;
import com.wordnote.workbox.dto.request.WorkBoxCreateDto;
import com.wordnote.workbox.dto.request.WorkBoxOptionUpdateDto;
import com.wordnote.workbox.entity.Status;
import com.wordnote.workbox.entity.WorkBox;
import com.wordnote.workbox.mapper.WorkBoxMapper;
import com.wordnote.workbox.repository.WorkBoxRepository;
import com.wordnote.workboxtask.WorkBoxTask;
import com.wordnote.workboxtask.WorkBoxTaskRepository;
import jakarta.persistence.EntityNotFoundException;
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
    public WorkBox createWorkBox(long memberId, WorkBoxCreateDto dto) {

        Integer max = workBoxRepository.findMaxSortIndex(); //sort

        Board board = boardRepository // 보드 조회
                .findByBoardIdAndMember_MemberId(dto.getBoardId(), memberId)
                .orElseThrow(() -> new EntityNotFoundException("보드 없음"));

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

        return savedBox;
    }

    //옵션변경
    @Transactional
    public WorkBox changeOption(long boxId, WorkBoxOptionUpdateDto request) {
        WorkBox foundBox = workBoxRepository.findById(boxId) //타겟검색
                .orElseThrow(() -> new EntityNotFoundException("WorkBox not found"));

        WorkBox updateBox = workBoxMapper.patchToWorkBoxOption(request, foundBox); //덮어쓰기

        return workBoxRepository.save(updateBox);
    }

    //상태변경
    @Transactional
    public WorkBox changeStatus(long boxId, Status next) {

        WorkBox box = workBoxRepository.findById(boxId).orElseThrow();
        box.changeStatus(next);

        return workBoxRepository.save(box);
    }

    //검색
    public WorkBox findById(long boxId) {
        return workBoxRepository.findById(boxId)
                .orElseThrow(() -> new RuntimeException("WorkBoxMapper not found: " + boxId));
    }

    //삭제
    @Transactional
    public void deleteWorkBox(long boxId) {
        workBoxRepository.deleteById(boxId);
    }
}
