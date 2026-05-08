package com.wordnote.global.advice;

import com.wordnote.exception.AuthException;
import com.wordnote.exception.ExceptionCode;
import com.wordnote.exception.LogicException;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.sql.SQLException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Business 범용
    @ExceptionHandler(LogicException.class)
    public ResponseEntity<?> handleLogicException(LogicException ex) {
        log.error("Logic error: {}", ex.getExceptionCode().getMessage());
        return toResponse(ex.getExceptionCode());
    }

    // Auth 범용 (401)
    @ExceptionHandler(AuthException.class)
    public ResponseEntity<?> handleAuth(AuthException ex) {
        log.error("Unhandled auth error: {}", ex.getExceptionCode().getMessage());
        return toResponse(ex.getExceptionCode());
    }

    //권한 부족 (403 Forbidden)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDeniedException(AccessDeniedException ex) {
        log.error("Access Denied: {}", ex.getMessage());
        return toResponse(ExceptionCode.FORBIDDEN);
    }

    //미인증 (401 Unauthorized)
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> handleAuthenticationException(AuthenticationException ex) {
        log.error("Authentication Failed: {}", ex.getMessage());
        return toResponse(ExceptionCode.UNAUTHORIZED);
    }


    // DB
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataException(DataIntegrityViolationException ex) {

        Throwable root = (ex.getRootCause() != null)
                ? ex.getRootCause()
                : ex.getMostSpecificCause();
        log.error("Unhandled data Exception: ", ex);

        return toResponse(resolveDataException(root));
    }

    // Validation(400)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {

        return toResponse(ExceptionCode.INVALID);
    }

    // resource없음(404)
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<?> handleNotFound(NoResourceFoundException ex) {
        log.error("NoResource Exception: ", ex);

        return toResponse(ExceptionCode.NOT_FOUND);
    }


    //server(500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        log.error("Unhandled server Exception: ", e);

        return toResponse(ExceptionCode.SERVER_ERROR);
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
    private ResponseEntity<?> toResponse(ExceptionCode code) {
        ProblemDetail detail = ProblemDetail.forStatus(code.getStatus());
        detail.setTitle(code.getCode());
        detail.setDetail(code.getMessage());

        return ResponseEntity.status(code.getStatus()).body(detail);
    }
}