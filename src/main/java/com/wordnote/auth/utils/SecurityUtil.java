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