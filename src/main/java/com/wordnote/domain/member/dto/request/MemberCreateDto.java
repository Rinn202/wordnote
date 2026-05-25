package com.wordnote.domain.member.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class MemberCreateDto {

    @NotBlank(message = "이름을 입력해주세요.")
    @Size(min = 2, max = 20, message = "이름은 2~20자여야 합니다.")
    @Pattern(
            regexp = "^[가-힣a-zA-Z ]+$",
            message = "이름은 한글/영문만 가능합니다."
    )
    private String name;

    @NotBlank
    private String nickname;

    @Email
    @NotBlank(message = "이메일을 입력해주세요.")
    private String email;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;
}