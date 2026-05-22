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
        Box box = boxRepository.findByBoxIdAndBoard_Member_MemberId(dto.getBoxId(), memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.BOX_TASK_NOT_FOUND));

        // ID 리스트만 조회
        List<Long> ids = boxTaskRepository.findIdsByBoxOrderBySortIndex(box);

        int currentIndex = ids.indexOf(boxTaskId);
        ids.remove(currentIndex);

        int targetIndex = dto.getTargetIndex();
        if (targetIndex > currentIndex) targetIndex--;
        if (targetIndex < 0) targetIndex = 0;
        if (targetIndex >= ids.size()) targetIndex = ids.size() - 1;

        ids.add(targetIndex, boxTaskId);

        // 벌크 UPDATE - 엔티티 객체 없이 ID만으로 처리
        for (int i = 0; i < ids.size(); i++) {
            boxTaskRepository.updateSortIndex(ids.get(i), i);
        }
    }

    @Transactional
    public void changeDone(long boxTaskId) {
        BoxTask boxTask = boxTaskRepository.findById(boxTaskId)
                .orElseThrow(() -> new LogicException(ExceptionCode.BOX_TASK_NOT_FOUND));
        boxTask.toggleDone(boxTask.getIsDone());

        Box box = boxTask.getBox();

        long total = boxTaskRepository.countByBox(box);
        long doneCount = boxTaskRepository.countByBoxAndIsDone(box, true);

        if (total == 0) {
            box.changeState(State.READY);
        } else if (doneCount == total) {
            box.changeState(State.DONE);
            boxTaskRepository.updateAllDoneByBox(box, true);  // 벌크 UPDATE
        } else if (doneCount > 0) {
            box.changeState(State.IN_PROGRESS);
        } else {
            box.changeState(State.READY);
            boxTaskRepository.updateAllDoneByBox(box, false); // 벌크 UPDATE
        }
    }
}
