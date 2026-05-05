package com.wordnote.workbox.service;

import com.wordnote.board.entity.Board;
import com.wordnote.board.repository.BoardRepository;
import com.wordnote.task.entity.Task;
import com.wordnote.task.repository.TaskRepository;
import com.wordnote.task.service.TaskService;
import com.wordnote.workbox.dto.request.WorkBoxCreateDto;
import com.wordnote.workbox.dto.request.WorkBoxOptionPatchDto;
import com.wordnote.workbox.dto.response.WorkBoxContentResponseDto;
import com.wordnote.workbox.entity.Status;
import com.wordnote.workbox.entity.WorkBox;
import com.wordnote.workbox.mapper.WorkBoxMapper;
import com.wordnote.workbox.repository.WorkBoxRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class WorkBoxService {
    private final WorkBoxRepository workBoxRepository;
    private final WorkBoxMapper workBoxMapper;
    private final TaskService taskService;
    private final BoardRepository boardRepository;
    private final TaskRepository taskRepository;

    //박스 생성
    @Transactional
    public WorkBox createWorkBox(long memberId, WorkBoxCreateDto dto) {

        Integer max = workBoxRepository.findMaxSortIndex(); // sort index

        Board board = boardRepository
                .findByBoardIdAndMember_MemberId(dto.getBoardId(), memberId)
                .orElseThrow(() -> new EntityNotFoundException("보드 없음")); // 보드 조회

        WorkBox box = WorkBox.builder()
                .sortIndex(max + 1)
                .build(); // 새 박스 생성

        box.setBoard(board); // 박스 - 보드 연결

        WorkBox savedBox = workBoxRepository.save(box); // 박스 저장 (PK 생성 + 관계 기준 확보)

        List<Task> tasks = taskService.findByIds(dto.getTaskIds()); //  Task 조회

        savedBox.setTasks(tasks); // 박스 - Task 연결 (N:N)

        return savedBox;
    }

    //옵션변경
    @Transactional
    public WorkBox changeOption(long boxId, WorkBoxOptionPatchDto request) {
        WorkBox foundBox = workBoxRepository.findById(boxId) //타겟검색
                .orElseThrow(() -> new EntityNotFoundException("WorkBox not found"));

        WorkBox updateBox = workBoxMapper.patchToWorkBoxOption(request, foundBox); //덮어쓰기

        return workBoxRepository.save(updateBox);
    }

    //테스크변경
    @Transactional
    public WorkBox updateTask(long boxId, WorkBoxContentResponseDto dto) {
        WorkBox box = workBoxRepository.findById(boxId)//타겟검색
                .orElseThrow(() -> new EntityNotFoundException("WorkBox not found"));

        WorkBox newBox = workBoxMapper.patchToWorkBoxByBoard(dto, box); //엔티티에 덮어쓰기
        return workBoxRepository.save(newBox);
    }

    //상태변경
    public WorkBox changeStatus(long boxId, Status next) {

        WorkBox box = workBoxRepository.findById(boxId).orElseThrow();
        box.changeStatus(next);

        return workBoxRepository.save(box);
    }

    //검색
    public WorkBox findById(Long boxId) {
        return workBoxRepository.findById(boxId)
                .orElseThrow(() -> new RuntimeException("WorkBoxMapper not found: " + boxId));
    }

    //삭제
    public void deleteWorkBox(Long boxId) {
        workBoxRepository.deleteById(boxId);
    }
}
