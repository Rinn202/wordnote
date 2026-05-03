package com.wordnote.member.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import lombok.Getter;

@Getter
public class MemberPatchDto {

    private String nickname;

    private String email;

    private String password;
}