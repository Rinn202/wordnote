package com.wordnote.auth.utils;

import com.wordnote.exception.ExceptionCode;
import com.wordnote.exception.LogicException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {
    public static long getMemberId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // email 인증을 통해 순수 authentication 객체로 받을 경우
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new LogicException(ExceptionCode.MEMBER_NOT_FOUND);
        }

        Object principal = authentication.getPrincipal();

        // OAuth를 통해 PrincipalDetails 객체로 받을 경우 로직
        if (principal instanceof PrincipalDetails principalDetails) {
            return principalDetails.getMember().getMemberId();
        }

        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            throw new LogicException(ExceptionCode.MEMBER_NOT_FOUND);
        }
    }

    public static String getRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new LogicException(ExceptionCode.MEMBER_NOT_FOUND);
        }

        return authentication.getAuthorities().toString();
    }
}