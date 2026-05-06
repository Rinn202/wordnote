package com.wordnote.util;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ExceptionCode {

    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "AUTH-001", "인증 필요"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "AUTH-002", "권한 없음"),

    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "MEMBER-001", "회원 없음"),

    INVALID(HttpStatus.BAD_REQUEST, "COMMON-001", "잘못된 요청"),

    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "DB-001", "이메일 중복"),
    DUPLICATE_DATA(HttpStatus.CONFLICT, "DB-002", "중복 데이터"),
    NOT_NULL(HttpStatus.BAD_REQUEST, "DB-003", "필수값 누락"),
    INVALID_REFERENCE(HttpStatus.CONFLICT, "DB-004", "참조 오류"),
    DB_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "DB-999", "DB 오류"),

    SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON-999", "서버 오류"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "COMMON-404", "요청하신 리소스를 찾을 수 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ExceptionCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}
