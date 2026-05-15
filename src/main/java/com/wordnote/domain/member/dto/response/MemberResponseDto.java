package com.wordnote.domain.member.dto.response;

import com.wordnote.domain.member.entity.MemberRole;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MemberResponseDto {

    private String nickname;

    private String email;

    private MemberRole role;

    private List<Long> boardIds;

    private String profileUri;

}
