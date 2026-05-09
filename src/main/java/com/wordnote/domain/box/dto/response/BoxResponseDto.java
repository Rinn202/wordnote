package com.wordnote.domain.box.dto.response;

import com.wordnote.domain.box.entity.AlarmType;
import com.wordnote.domain.box.entity.State;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class BoxResponseDto {
    private Long boxId;

    private String name;

    private State state;

    private Boolean bookmark;

    private Integer sortIndex;

    private AlarmType alarmType;

    private LocalTime expireTime;

    private LocalDateTime createdAt;

    private List<BoxTaskDetailDto> tasks;

    @Getter
    @Builder
    public static class BoxTaskDetailDto {
        private Long taskId;
        private String taskName;
        private Long boxTaskId;   // 중간 엔티티 PK
        private Integer sortIndex;
    }
}
