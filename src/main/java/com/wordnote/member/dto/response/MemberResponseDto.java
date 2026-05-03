package com.wordnote.member.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MemberResponseDto {

    private Long memberId;
    private String name;
    private String nickname;
    private String email;

    private LocalDateTime createdAt;
}
