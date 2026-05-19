package com.wordnote.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ExceptionCode {

    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "AUTH-001", "인증 필요"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "AUTH-002", "권한 없음"),
    TOKEN_ERROR(HttpStatus.UNAUTHORIZED, "AUTH-003", "유효하지 않은 토큰입니다."),
    AUTH_ERROR(HttpStatus.UNAUTHORIZED, "AUTH-999", "인증 오류"),

    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "MEMBER-001", "회원 없음"),
    INVALID_LOGIN_ATTEMPT(HttpStatus.BAD_REQUEST, "MEMBER-002", "로그인 실패"),

    INVALID(HttpStatus.BAD_REQUEST, "COMMON-001", "잘못된 요청"),
    INVALID_INDEX(HttpStatus.BAD_REQUEST, "COMMON-002", "잘못된 값"),

    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "DB-001", "이메일 중복"),
    DUPLICATE_DATA(HttpStatus.CONFLICT, "DB-002", "중복 데이터"),
    NOT_NULL(HttpStatus.BAD_REQUEST, "DB-003", "필수값 누락"),
    INVALID_REFERENCE(HttpStatus.CONFLICT, "DB-004", "참조 오류"),

    BOARD_NOT_FOUND(HttpStatus.NOT_FOUND, "DB-005", "보드를 찾을수 없습니다"),
    BOX_NOT_FOUND(HttpStatus.NOT_FOUND, "DB-006", "박스를 찾을수 없습니다"),
    TASK_NOT_FOUND(HttpStatus.NOT_FOUND, "DB-007", "테스크를 찾을수 없습니다"),
    BOX_TASK_NOT_FOUND(HttpStatus.NOT_FOUND, "DB-008", "박스테스크를 찾을수 없습니다"),
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
