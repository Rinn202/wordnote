package com.wordnote.board.dto.request;

import com.wordnote.board.entity.Type;
import com.wordnote.member.entity.Member;
import com.wordnote.workbox.dto.request.WorkBoxPatchDto;
import com.wordnote.workbox.entity.WorkBox;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class BoardPatchDto {
    private Type type;
    private Integer sortIndex;
    private List<WorkBoxPatchDto> boxes;
}
