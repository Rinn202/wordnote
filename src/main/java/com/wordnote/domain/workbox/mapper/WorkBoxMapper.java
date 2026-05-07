package com.wordnote.domain.workbox.mapper;

import com.wordnote.domain.task.entity.Task;
import com.wordnote.domain.task.mapper.TaskMapper;
import com.wordnote.domain.workbox.dto.request.WorkBoxOptionUpdateDto;
import com.wordnote.domain.workbox.dto.response.WorkBoxResponseDto;
import com.wordnote.domain.workbox.entity.WorkBox;
import com.wordnote.domain.workboxtask.WorkBoxTask;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class WorkBoxMapper {
    private final TaskMapper taskMapper;

    //dto -> Entity
    //상태, 북마크, 알람시간, 만료시간, 정렬인덱스
    public WorkBox patchToWorkBoxOption(WorkBoxOptionUpdateDto workBoxPatchDto, WorkBox foundBox) {
        if (workBoxPatchDto == null) return null;

        foundBox.update(workBoxPatchDto.getStatus(), workBoxPatchDto.getBookmark(),
                workBoxPatchDto.getAlarmTime(), workBoxPatchDto.getExpiredAt(),
                workBoxPatchDto.getSortIndex());

        return foundBox;
    }

    //responseDto로 변환
    public WorkBoxResponseDto toBoxResponseDto(WorkBox workBox) {
        if (workBox == null) return null;

        List<Task> tasks = workBox.getWorkBoxTasks().stream()
                .map(WorkBoxTask::getTask) // WorkBoxTask 객체에서 Task 객체만 꺼냄
                .toList();

        return WorkBoxResponseDto.builder()
                .boxId(workBox.getBoxId())
                .status(workBox.getStatus())
                .tasks(taskMapper.toResponseDtos(tasks))
                .alarmTime(workBox.getAlarmTime())
                .expiredAt(workBox.getExpiredAt())
                .bookmark(workBox.getBookmark())
                .sortIndex(workBox.getSortIndex())
                .createdAt(workBox.getCreatedAt()) // 생성 시간 포함
                .build();
    }

    public List<WorkBoxResponseDto> toBoxesResponseDtos(List<WorkBox> boxes) {
        return boxes.stream().map(this::toBoxResponseDto).toList();
    }
}
