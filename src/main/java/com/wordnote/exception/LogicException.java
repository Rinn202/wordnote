package com.wordnote.exception;

import lombok.Getter;

@Getter
public class LogicException extends RuntimeException {
    private final ExceptionCode exceptionCode;

    public LogicException(ExceptionCode exceptionCode) {
        super(exceptionCode.getMessage());  //시스템 기본 출력
        this.exceptionCode = exceptionCode;     //커스텀 http 표시
    }
}

