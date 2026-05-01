package com.wordnote.boxlist.mapper;

import com.wordnote.boxlist.dto.request.ListPostDto;
import com.wordnote.boxlist.dto.response.ListResponseDto;
import com.wordnote.workbox.dto.request.WorkBoxPatchDto;
import com.wordnote.workbox.dto.request.WorkBoxPostDto;
import com.wordnote.workbox.entity.WorkBox;
import com.wordnote.workbox.mapper.WorkBoxMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ListMapper {

    private final WorkBoxMapper workBoxMapper;

    public List<WorkBox> postToWorKBoxList(List<WorkBoxPostDto> workBoxPostDtos) {
        if (workBoxPostDtos == null) return Collections.emptyList();

        return workBoxPostDtos.stream()
                .map(workBoxMapper::postToWorkBox)
                .collect(Collectors.toList());
    }

    public List<WorkBox> patchToWorKBoxList(List<WorkBoxPatchDto> workBoxPatchDtos) {
        if (workBoxPatchDtos == null) return Collections.emptyList();

        return workBoxPatchDtos.stream()
                .map(workBoxMapper::patchToWorkBox)
                .collect(Collectors.toList());
    }

    //List -> ResponseDto
    public ListResponseDto toResponseListDto(List<WorkBox> workBoxes) {
        return new ListResponseDto(workBoxes != null ? workBoxes : Collections.emptyList());
    }

    //postDto -> List
    public List<WorkBox> toWorkBoxes(ListPostDto postDto){
        return postDto.getBlocks().stream()
                .map(box -> {
                    return WorkBox.builder()
                            .workBoxId(box.getWorkBoxId())
                            .status(box.getStatus())
                            .alarmTime(box.getAlarmTime())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
