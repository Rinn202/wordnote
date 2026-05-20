package com.wordnote.domain.member.dto.response;

import com.wordnote.domain.member.entity.Role;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class MemberResponseDto {

    private String nickname;

    private String email;

    private Role role;

    private List<Long> boardIds;

    private String profileUri;

    private LocalDateTime createdAt;

}
