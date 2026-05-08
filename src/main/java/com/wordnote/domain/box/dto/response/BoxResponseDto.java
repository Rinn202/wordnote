package com.wordnote.domain.box.dto.response;

import com.wordnote.domain.box.entity.AlarmType;
import com.wordnote.domain.box.entity.State;
import com.wordnote.domain.task.dto.response.TaskResponseDto;
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

    private State state;

    private List<TaskResponseDto> tasks;

    private Boolean bookmark;

    private Integer sortIndex;

    private AlarmType alarmType;

    private LocalTime expireTime;

    private LocalDateTime createdAt;
}
