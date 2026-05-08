package com.wordnote.domain.box.mapper;

import com.wordnote.domain.box.dto.request.BoxOptionChangeDto;
import com.wordnote.domain.box.dto.response.BoxResponseDto;
import com.wordnote.domain.box.entity.Box;
import com.wordnote.domain.boxtask.BoxTask;
import com.wordnote.domain.boxtask.BoxTaskRepository;
import com.wordnote.domain.task.entity.Task;
import com.wordnote.domain.task.mapper.TaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class BoxMapper {
    private final TaskMapper taskMapper;
    private final BoxTaskRepository boxTaskRepository;

    //dto -> Entity
    //상태, 북마크, 알람시간, 만료시간, 정렬인덱스
    public Box patchToBoxOption(BoxOptionChangeDto boxPatchDto, Box foundBox) {
        if (boxPatchDto == null) return null;

        foundBox.update(boxPatchDto.getBookmark(), boxPatchDto.getAlarmType(),
                boxPatchDto.getExpireTime(), boxPatchDto.getSortIndex());

        return foundBox;
    }

    //responseDto로 변환
    public BoxResponseDto toBoxResponseDto(Box box) {
        if (box == null) return null;

        List<Task> tasks = box.getBoxTasks().stream()
                .map(BoxTask::getTask) // BoxTask 객체에서 Task 객체만 꺼냄
                .toList();

        return BoxResponseDto.builder()
                .boxId(box.getBoxId())
                .state(box.getState())
                .tasks(taskMapper.toResponseDtos(tasks))
                .alarmType(box.getAlarmType())
                .expireTime(box.getExpireTime())
                .bookmark(box.getBookmark())
                .sortIndex(box.getSortIndex())
                .createdAt(box.getCreatedAt()) // 생성 시간 포함
                .build();
    }

    public List<BoxResponseDto> toBoxesResponseDtos(List<Box> boxes) {
        return boxes.stream().map(this::toBoxResponseDto).toList();
    }
}
