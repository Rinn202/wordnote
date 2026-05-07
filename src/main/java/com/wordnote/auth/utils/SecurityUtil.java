package com.wordnote.auth.utils;

import com.wordnote.exception.ExceptionCode;
import com.wordnote.exception.LogicException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {
    public static long getMemberId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new LogicException(ExceptionCode.MEMBER_NOT_FOUND);
        }
        // Principal에 저장된 ID를 꺼내옵니다 (인증 시점에 무엇을 넣었느냐에 따라 다름)

        return Long.parseLong(authentication.getName());
    }

    public static String getRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new LogicException(ExceptionCode.MEMBER_NOT_FOUND);
        }

        return authentication.getAuthorities().toString();
    }
}