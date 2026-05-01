package com.wordnote.boxlist.dto.response;

import com.wordnote.boxlist.entity.BoxList;
import com.wordnote.workbox.entity.WorkBox;
import lombok.Getter;

import java.util.List;

@Getter
public class ListResponseDto {
    private List<WorkBox> lists;

    public ListResponseDto(List<WorkBox> list) {
    }
}
