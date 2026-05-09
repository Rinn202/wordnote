package com.wordnote.domain.box.mapper;

import com.wordnote.domain.box.dto.request.BoxOptionChangeDto;
import com.wordnote.domain.box.dto.response.BoxResponseDto;
import com.wordnote.domain.box.entity.Box;
import com.wordnote.domain.boxtask.BoxTask;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class BoxMapper {

    //dto -> Entity
    //상태, 북마크, 알람시간, 만료시간, 정렬인덱스
    public void patchToBoxOption(BoxOptionChangeDto boxPatchDto, Box foundBox) {
        if (boxPatchDto == null) return;

        foundBox.update(boxPatchDto.getBookmark(), boxPatchDto.getAlarmType(),
                boxPatchDto.getExpireTime(), boxPatchDto.getSortIndex());

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
                                .build()
                        )
                        .toList();

        return BoxResponseDto.builder()
                .boxId(box.getBoxId())
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
}
