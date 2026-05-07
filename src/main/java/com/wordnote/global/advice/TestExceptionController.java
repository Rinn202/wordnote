package com.wordnote.global.advice;

import com.wordnote.exception.AuthException;
import com.wordnote.exception.ExceptionCode;
import com.wordnote.exception.LogicException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestExceptionController {

    @GetMapping("/logic")
    public String logic() {
        throw new LogicException(ExceptionCode.MEMBER_NOT_FOUND);
    }

    @GetMapping("/auth")
    public String auth() {
        throw new AuthException(ExceptionCode.UNAUTHORIZED);
    }

    @GetMapping("/db")
    public String db() {
        throw new DataIntegrityViolationException("test db error");
    }

    @GetMapping("/system")
    public String system() {
        throw new NullPointerException("test");
    }
}