package com.wordnote.workbox.mapper;

import com.wordnote.workbox.dto.request.WorkBoxPatchDto;
import com.wordnote.workbox.dto.request.WorkBoxPostDto;
import com.wordnote.workbox.dto.response.WorkBoxResposeDto;
import com.wordnote.workbox.entity.WorkBox;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WorkBoxMapper {
    //post -> Entity 로 변환
    public WorkBox postToWorkBox(WorkBoxPostDto workBox) {
        if (workBox == null) return null;

        return WorkBox.builder()
                .status(workBox.getStatus())
                .alarmTime(workBox.getAlarmTime())
                .expiredAt(workBox.getExpiredAt())
                .bookmark(workBox.getBookmark())
                .build();
    }
    //patch -> Entity 로 변환
    public WorkBox patchToWorkBox(WorkBoxPatchDto workBox) {
        if (workBox == null) return null;

        return WorkBox.builder()
                .status(workBox.getStatus())
                .alarmTime(workBox.getAlarmTime())
                .expiredAt(workBox.getExpiredAt())
                .bookmark(workBox.getBookmark())
                .build();
    }

    //responseDto로 변환
    public WorkBoxResposeDto resposeDto(WorkBox workBox){
        if (workBox == null) return null;

        return WorkBoxResposeDto.builder()
                .workBoxId(workBox.getWorkBoxId())
                .status(workBox.getStatus())
                .alarmTime(workBox.getAlarmTime())
                .expiredAt(workBox.getExpiredAt())
                .bookmark(workBox.getBookmark())
                .createdAt(workBox.getCreatedAt()) // 생성 시간 포함
                .build();
    }
}
