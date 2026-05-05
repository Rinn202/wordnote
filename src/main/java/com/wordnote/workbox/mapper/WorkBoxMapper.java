package com.wordnote.workbox.mapper;

import com.wordnote.task.mapper.TaskMapper;
import com.wordnote.workbox.dto.request.WorkBoxOptionPatchDto;
import com.wordnote.workbox.dto.request.WorkBoxContentPatchDto;
import com.wordnote.workbox.dto.response.WorkBoxContentResponseDto;
import com.wordnote.workbox.dto.response.WorkBoxResponseDto;
import com.wordnote.workbox.entity.WorkBox;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WorkBoxMapper {
    private final TaskMapper taskMapper;

    //patch -> Entity 로 변환
    //상태, 북마크, 알람시간, 만료시간, 정렬인덱스
    public WorkBox patchToWorkBoxOption(WorkBoxOptionPatchDto workBoxPatchDto, WorkBox foundBox) {
        if (workBoxPatchDto == null) return null;

        foundBox.update(workBoxPatchDto.getStatus(), workBoxPatchDto.getBookmark(),
                workBoxPatchDto.getAlarmTime(), workBoxPatchDto.getExpiredAt(),
                workBoxPatchDto.getSortIndex());

        return foundBox;
    }
    //테스크 변경
    public WorkBox patchToWorkBoxByBoard(WorkBoxContentResponseDto requestOption, WorkBox foundBox) {
        if (requestOption == null) return null;

        foundBox.update(requestOption.getBoard(),
                requestOption.getTasks());

        return foundBox;
    }

    //responseDto로 변환
    public WorkBoxResponseDto toWorkBoxDto(WorkBox workBox) {
        if (workBox == null) return null;

        return WorkBoxResponseDto.builder()
                .boxId(workBox.getBoxId())
                .status(workBox.getStatus())
                .tasks(taskMapper.toResponseDtos(workBox.getTasks()))
                .alarmTime(workBox.getAlarmTime())
                .expiredAt(workBox.getExpiredAt())
                .bookmark(workBox.getBookmark())
                .sortIndex(workBox.getSortIndex())
                .createdAt(workBox.getCreatedAt()) // 생성 시간 포함
                .build();
    }

    public WorkBox patchToWorkBox(WorkBoxContentPatchDto workBoxContentPatchDto) {
        if (workBoxContentPatchDto == null) return null;

        return WorkBox.builder()
                .boxId(workBoxContentPatchDto.getBoxId())
                .tasks(workBoxContentPatchDto.getTasks())
                .build();
    }
}
