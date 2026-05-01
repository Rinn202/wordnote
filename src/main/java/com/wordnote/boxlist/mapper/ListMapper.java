package com.wordnote.boxlist.mapper;

import com.wordnote.boxlist.dto.request.ListPatchDto;
import com.wordnote.boxlist.dto.request.ListPostDto;
import com.wordnote.boxlist.dto.response.ListResponseDto;
import com.wordnote.workbox.entity.WorkBox;
import com.wordnote.workbox.mapper.WorkBoxMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ListMapper {

    private final WorkBoxMapper workBoxMapper;

    //List<entity> -> ResponsDto
    public ListResponseDto toResponseListDto(List<WorkBox> workBoxes) {
        return new ListResponseDto(workBoxes != null ? workBoxes : Collections.emptyList());
    }

    //ListPostDto -> List<Entity>
    public List<WorkBox> toWorkBoxList(ListPostDto postDto) {
        if (postDto == null || postDto.getBoxes() == null) {
            return Collections.emptyList();
        }

        return postDto.getBoxes();
    }

    //ListPatchDto -> List<Entity>
    public List<WorkBox> toWorkBoxList(ListPatchDto patchDto) {
        if (patchDto == null || patchDto.getBoxes() == null) {
            return Collections.emptyList();
        }

        return patchDto.getBoxes();
    }
}