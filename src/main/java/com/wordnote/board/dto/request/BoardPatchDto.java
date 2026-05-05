package com.wordnote.board.dto.request;

import com.wordnote.board.entity.Type;
import com.wordnote.workbox.dto.request.WorkBoxContentPatchDto;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class BoardPatchDto {
    private Type type;
    private List<Long> boxIds;
}
