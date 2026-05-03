package com.wordnote.workbox.mapper;

import com.wordnote.workbox.dto.request.WorkBoxPatchDto;
import com.wordnote.workbox.dto.request.WorkBoxPostDto;
import com.wordnote.workbox.dto.response.WorkBoxResponseDto;
import com.wordnote.workbox.entity.WorkBox;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@Getter
@RequiredArgsConstructor
public class WorkBoxMapper {
    //post -> Entity 로 변환
    public WorkBox postToWorkBox(WorkBoxPostDto workBoxPostDto) {
        if (workBoxPostDto == null) return null;

        return WorkBox.builder()
                .status(workBoxPostDto.getStatus())
                .alarmTime(workBoxPostDto.getAlarmTime())
                .expiredAt(workBoxPostDto.getExpiredAt())
                .bookmark(workBoxPostDto.getBookmark())
                .build();
    }
    //patch -> Entity 로 변환
    public WorkBox patchToWorkBox(WorkBoxPatchDto workBoxPatchDto) {
        if (workBoxPatchDto == null) return null;

        return WorkBox.builder()
                .status(workBoxPatchDto.getStatus())
                .alarmTime(workBoxPatchDto.getAlarmTime())
                .expiredAt(workBoxPatchDto.getExpiredAt())
                .bookmark(workBoxPatchDto.getBookmark())
                .build();
    }

    //responseDto로 변환
    public WorkBoxResponseDto toWorkBoxDto(WorkBox workBox){
        if (workBox == null) return null;

        return WorkBoxResponseDto.builder()
                .boxId(workBox.getBoxId())
                .status(workBox.getStatus())
                .alarmTime(workBox.getAlarmTime())
                .expiredAt(workBox.getExpiredAt())
                .bookmark(workBox.getBookmark())
                .createdAt(workBox.getCreatedAt()) // 생성 시간 포함
                .build();
    }
}
