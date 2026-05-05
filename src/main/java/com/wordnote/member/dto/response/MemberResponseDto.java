package com.wordnote.member.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class MemberResponseDto {

    private String nickname;
    private String email;
    private String password;
    private List<Long> boardIds;

    private LocalDateTime createdAt;
}
