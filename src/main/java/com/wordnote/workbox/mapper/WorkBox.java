package com.wordnote.workbox.mapper;

import com.wordnote.workbox.dto.request.WorkBoxPatchDto;
import com.wordnote.workbox.dto.request.WorkBoxPostDto;
import com.wordnote.workbox.dto.response.WorkBoxResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WorkBox {
    //post -> Entity 로 변환
    public com.wordnote.workbox.entity.WorkBox postToWorkBox(WorkBoxPostDto workBoxPostDto) {
        if (workBoxPostDto == null) return null;

        return com.wordnote.workbox.entity.WorkBox.builder()
                .status(workBoxPostDto.getStatus())
                .alarmTime(workBoxPostDto.getAlarmTime())
                .expiredAt(workBoxPostDto.getExpiredAt())
                .bookmark(workBoxPostDto.getBookmark())
                .build();
    }
    //patch -> Entity 로 변환
    public com.wordnote.workbox.entity.WorkBox patchToWorkBox(WorkBoxPatchDto workBoxPatchDto) {
        if (workBoxPatchDto == null) return null;

        return com.wordnote.workbox.entity.WorkBox.builder()
                .status(workBoxPatchDto.getStatus())
                .alarmTime(workBoxPatchDto.getAlarmTime())
                .expiredAt(workBoxPatchDto.getExpiredAt())
                .bookmark(workBoxPatchDto.getBookmark())
                .build();
    }

    //responseDto로 변환
    public WorkBoxResponseDto toWorkBoxDto(com.wordnote.workbox.entity.WorkBox workBox){
        if (workBox == null) return null;

        return WorkBoxResponseDto.builder()
                .workBoxId(workBox.getWorkBoxId())
                .status(workBox.getStatus())
                .alarmTime(workBox.getAlarmTime())
                .expiredAt(workBox.getExpiredAt())
                .bookmark(workBox.getBookmark())
                .createdAt(workBox.getCreatedAt()) // 생성 시간 포함
                .build();
    }
}
