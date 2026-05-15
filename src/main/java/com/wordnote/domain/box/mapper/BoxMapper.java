package com.wordnote.domain.box.mapper;

import com.wordnote.domain.box.dto.request.BoxCreateDto;
import com.wordnote.domain.box.dto.request.BoxOptionChangeDto;
import com.wordnote.domain.box.dto.response.BoxResponseDto;
import com.wordnote.domain.box.entity.Box;
import com.wordnote.domain.boxtask.entity.BoxTask;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class BoxMapper {

    //dto -> entity
    //상태, 북마크, 알람시간, 만료시간, 정렬인덱스
    public void patchToBoxOption(BoxOptionChangeDto boxPatchDto, Box foundBox) {
        if (boxPatchDto == null) return;

        foundBox.update(boxPatchDto.getBookmark(), boxPatchDto.getAlarmType(),
                boxPatchDto.getExpireTime());

    }

    public BoxResponseDto toBoxResponseDto(Box box) {
        if (box == null) return null;

        List<BoxResponseDto.BoxTaskDetailDto> tasks =
                Optional.ofNullable(box.getBoxTasks())
                        .orElse(List.of())
                        .stream()
                        .sorted(Comparator.comparing(BoxTask::getSortIndex))
                        .map(bt -> BoxResponseDto.BoxTaskDetailDto.builder()
                                .boxTaskId(bt.getBoxTaskId())
                                .taskId(bt.getTask().getTaskId())
                                .taskName(bt.getTask().getName())
                                .sortIndex(bt.getSortIndex())
                                .isDone(bt.getIsDone())
                                .build()
                        )
                        .toList();

        return BoxResponseDto.builder()
                .boxId(box.getBoxId())
                .boxType(box.getBoxType())
                .name(box.getName())
                .state(box.getState())
                .tasks(tasks)
                .alarmType(box.getAlarmType())
                .expireTime(box.getExpireTime())
                .bookmark(box.getBookmark())
                .sortIndex(box.getSortIndex())
                .createdAt(box.getCreatedAt())
                .build();
    }

    public List<BoxResponseDto> toBoxesResponseDtos(List<Box> boxes) {
        return boxes.stream().map(this::toBoxResponseDto).toList();
    }

    public Box toBox(BoxCreateDto dto, Integer max) {
        return Box.builder()
                .sortIndex(max + 1)
                .name(dto.getName())
                .boxType(dto.getBoxType()).build();  // 새 Box 생성
    }
}
