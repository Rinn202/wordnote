package com.wordnote.domain.boxtask.service;

import com.wordnote.domain.box.entity.Box;
import com.wordnote.domain.box.entity.State;
import com.wordnote.domain.box.repository.BoxRepository;
import com.wordnote.domain.boxtask.BoxTask;
import com.wordnote.domain.boxtask.BoxTaskRepository;
import com.wordnote.domain.boxtask.dto.MoveTaskRequest;
import com.wordnote.exception.ExceptionCode;
import com.wordnote.exception.LogicException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class BoxTaskService {
    private final BoxTaskRepository boxTaskRepository;
    private final BoxRepository boxRepository;

    //박스내 task 위치이동
    @Transactional
    public void moveTask(MoveTaskRequest request, Long boxTaskId) {

        BoxTask boxTask = boxTaskRepository.findById(boxTaskId)
                .orElseThrow(() -> new LogicException(ExceptionCode.TASK_NOT_FOUND));
        List<BoxTask> boxTasks = boxTaskRepository.findByBox_BoxIdOrderBySortIndexAsc(request.getBoxId());

        if (request.getTargetIndex() < 0 ||
                request.getTargetIndex() > boxTasks.size()) {
            throw new RuntimeException("요청 index가 list 범위를 초과합니다.");
        }
        boxTasks.removeIf(bt ->
                bt.getBoxTaskId().equals(boxTask.getBoxTaskId()));
        boxTasks.add(request.getTargetIndex(), boxTask); //삭제 후 원하는 자리에 끼워넣기

        for (int i = 0; i < boxTasks.size(); i++) {
            boxTasks.get(i).setSortIndex(i);
        }
    }

    @Transactional
    public void changeState(long boxTaskId) {
        BoxTask boxTask = boxTaskRepository.findById(boxTaskId)
                .orElseThrow(() -> new LogicException(ExceptionCode.TASK_NOT_FOUND));
        boxTask.setIsDone(!boxTask.getIsDone());

        //task - box 상태 연동
        Box box = boxTask.getBox();

        boolean allDone = !box.getBoxTasks().isEmpty()
                && box.getBoxTasks().stream()
                .allMatch(BoxTask::getIsDone);

        boolean anyDone = box.getBoxTasks().stream()
                .anyMatch(BoxTask::getIsDone);

        if (allDone) {
            box.changeState(State.DONE);
        } else if (anyDone) {
            box.changeState(State.IN_PROGRESS);
        } else {
            box.changeState(State.READY);
        }
    }
}
