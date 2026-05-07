package com.wordnote.exception;

import lombok.Getter;

@Getter
public class AuthException extends RuntimeException {
    private final ExceptionCode exceptionCode;

    public AuthException(ExceptionCode exceptionCode) {
        super(exceptionCode.getMessage());
        this.exceptionCode = exceptionCode;
    }
}

