package com.wordnote.domain.box.dto.request;

import com.wordnote.domain.box.entity.AlarmType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BoxOptionChangeDto {
    private Boolean bookmark;

    private Integer sortIndex;

    private AlarmType alarmType;

    private LocalTime expireTime;

}