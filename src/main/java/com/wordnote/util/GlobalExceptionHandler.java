package com.wordnote.util;

import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.sql.SQLException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Business
    @ExceptionHandler(LogicException.class)
    public ResponseEntity<Object> handleLogicException(LogicException ex) {
        return toResponse(ex.getExceptionCode());
    }

    // Auth
    @ExceptionHandler(AuthException.class)
    public ResponseEntity<Object> handleAuth(AuthException ex) {
        return toResponse(ex.getExceptionCode());
    }

    // DB
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataException(DataIntegrityViolationException e) {

        Throwable root = (e.getRootCause() != null)
                ? e.getRootCause()
                : e.getMostSpecificCause();

        return toResponse(resolveDataException(root));
    }

    // Validation
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidation(MethodArgumentNotValidException e) {
        return toResponse(ExceptionCode.INVALID);
    }

    // System
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Object> handleNotFound(NoResourceFoundException e) {  //404
        return toResponse(ExceptionCode.NOT_FOUND);
    }

//서버 터짐 방지 코드
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleException(Exception e) {    //500
        log.error("Unhandled Exception: ", e);

        return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // DB 분기
    private ExceptionCode resolveDataException(Throwable root) {

        if (root instanceof ConstraintViolationException ex) {
            String name = ex.getConstraintName();

            if (name != null && name.contains("uk_member_email")) {
                return ExceptionCode.DUPLICATE_EMAIL;
            }
        }

        if (root instanceof SQLException ex) {
            return switch (ex.getSQLState()) {
                case "23502" -> ExceptionCode.NOT_NULL;
                case "23505" -> ExceptionCode.DUPLICATE_DATA;
                case "23503" -> ExceptionCode.INVALID_REFERENCE;
                default -> ExceptionCode.DB_ERROR;
            };
        }

        return ExceptionCode.DB_ERROR;
    }

    // 응답 통일
    private ResponseEntity<Object> toResponse(ExceptionCode code) {
        ProblemDetail detail = ProblemDetail.forStatus(code.getStatus());
        detail.setTitle(code.getCode());
        detail.setDetail(code.getMessage());

        return ResponseEntity.status(code.getStatus()).body(detail);
    }
}