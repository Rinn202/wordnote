package com.wordnote.domain.member.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class PasswordRequest {

    @NotBlank
    private String password;
}
