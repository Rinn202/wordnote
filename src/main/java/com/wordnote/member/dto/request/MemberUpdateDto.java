package com.wordnote.member.dto.request;

import lombok.Getter;

@Getter
public class MemberUpdateDto {

    private String nickname;

    private String email;

    private String password;
}