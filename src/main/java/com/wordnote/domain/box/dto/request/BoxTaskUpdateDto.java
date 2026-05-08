package com.wordnote.domain.box.dto.request;

import com.wordnote.domain.task.entity.Task;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BoxTaskUpdateDto {

    private List<Task> tasks;
}