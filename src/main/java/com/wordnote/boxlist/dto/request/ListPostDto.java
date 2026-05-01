package com.wordnote.boxlist.dto.request;

import com.wordnote.boxlist.entity.Type;
import com.wordnote.member.entity.Member;
import com.wordnote.workbox.entity.WorkBox;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ListPostDto {
    Type type;

    Integer sortIndex;

    Member member;

    List<WorkBox> boxes;
}
