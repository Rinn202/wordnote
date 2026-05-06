package com.wordnote;

import com.wordnote.util.AuthException;
import com.wordnote.util.ExceptionCode;
import com.wordnote.util.LogicException;
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