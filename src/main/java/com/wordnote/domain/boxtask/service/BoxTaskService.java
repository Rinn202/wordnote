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

        int currentIndex = boxTasks.indexOf(boxTask);
        boxTasks.remove(boxTask);

        // remove 후 targetIndex 보정
        int targetIndex = dto.getTargetIndex();
        if (targetIndex > currentIndex) targetIndex--;

        if (targetIndex < 0) targetIndex = 0;
        if (targetIndex >= boxTasks.size()) targetIndex = boxTasks.size() - 1;

        boxTasks.add(targetIndex, boxTask);

        for (int i = 0; i < boxTasks.size(); i++) {
            boxTasks.get(i).setSortIndex(i);
        }
    }

    @Transactional
    public void changeDone(long boxTaskId) {
        BoxTask boxTask = boxTaskRepository.findById(boxTaskId)
                .orElseThrow(() -> new LogicException(ExceptionCode.BOX_TASK_NOT_FOUND));
        boxTask.toggleDone(boxTask.getIsDone());

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
