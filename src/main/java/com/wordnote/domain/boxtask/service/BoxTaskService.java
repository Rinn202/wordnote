package com.wordnote.domain.boxtask.service;

import com.wordnote.domain.box.entity.Box;
import com.wordnote.domain.box.entity.State;
import com.wordnote.domain.box.repository.BoxRepository;
import com.wordnote.domain.boxtask.dto.MoveTaskRequest;
import com.wordnote.domain.boxtask.entity.BoxTask;
import com.wordnote.domain.boxtask.repository.BoxTaskRepository;
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

    @Transactional
    public void changeIndex(long boxTaskId, MoveTaskRequest dto, long memberId) {

        BoxTask boxTask = boxTaskRepository.findById(boxTaskId)
                .orElseThrow(() -> new LogicException(ExceptionCode.TASK_NOT_FOUND));

        Box box = boxRepository.findByBoxIdAndBoard_Member_MemberId(
                        dto.getBoxId(), memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.BOX_TASK_NOT_FOUND));

        List<BoxTask> boxTasks = box.getBoxTasks();

        if (dto.getTargetIndex() < 0 || dto.getTargetIndex() >= boxTasks.size()) {
            throw new LogicException(ExceptionCode.INVALID_INDEX);
        }

        boxTasks.remove(boxTask);
        boxTasks.add(dto.getTargetIndex(), boxTask);

        //index 재정렬
        for (int i = 0; i < boxTasks.size(); i++) {
            boxTasks.get(i).setSortIndex(i);
        }
    }

    @Transactional
    public void changeDone(long boxTaskId) {
        BoxTask boxTask = boxTaskRepository.findById(boxTaskId)
                .orElseThrow(() -> new LogicException(ExceptionCode.BOX_TASK_NOT_FOUND));
        boxTask.toggleDone(boxTask.getIsDone());

        //============================================================================
//        Box box = boxRepository.findById(boxTask.getBox().getBoxId())
//                .orElseThrow(() -> new LogicException(ExceptionCode.BOX_NOT_FOUND));

        Box box = boxTask.getBox();

        List<BoxTask> boxTasks = box.getBoxTasks();

        boolean allDone = boxTasks.stream().allMatch(BoxTask::getIsDone);

        boolean anyDone = boxTasks.stream().anyMatch(BoxTask::getIsDone);

        if (boxTasks.isEmpty()) {
            box.changeState(State.READY);
        } else if (allDone) {
            box.changeState(State.DONE);
        } else if (anyDone) {
            box.changeState(State.IN_PROGRESS);
        } else {
            box.changeState(State.READY);
        }
    }
}
