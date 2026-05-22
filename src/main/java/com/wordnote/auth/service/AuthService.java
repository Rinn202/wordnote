package com.wordnote.auth.service;

import com.wordnote.auth.dto.LoginResponseDto;
import com.wordnote.auth.dto.TokenResponseDto;
import com.wordnote.auth.utils.JwtTokenizer;
import com.wordnote.domain.member.entity.Member;
import com.wordnote.domain.member.repository.MemberRepository;
import com.wordnote.exception.ExceptionCode;
import com.wordnote.exception.LogicException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final JwtTokenizer jwtTokenizer;
    private final PasswordEncoder passwordEncoder;

    public LoginResponseDto login(String email, String password, HttpServletResponse response) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new LogicException(ExceptionCode.INVALID_LOGIN_ATTEMPT)); //유저검색

        if (!passwordEncoder.matches(password, member.getPassword())) {
            log.warn("로그인 실패: 비밀번호 불일치 - Email: {}", email);
            throw new LogicException(ExceptionCode.INVALID_LOGIN_ATTEMPT); //패스워드 확인(인코더 매칭)
        }

        Map<String, Object> claims = new HashMap<>();//토큰정보 생성
        claims.put("role", member.getRole());
        claims.put("memberId", member.getMemberId());
        claims.put("email", member.getEmail());

        String subject = member.getEmail(); //토큰 생성
        String accessToken = jwtTokenizer.generateAccessToken(claims, subject);
        String newRefreshToken =
                jwtTokenizer.generateRefreshToken(subject);

        ResponseCookie cookie = ResponseCookie.from(
                        "refreshToken",
                        newRefreshToken
                )
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(60 * 60 * 24 * 14)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());


        return new LoginResponseDto(accessToken, member.getNickname(), String.valueOf(member.getRole()));
    }

    public TokenResponseDto refresh(String refreshToken,
                                    HttpServletResponse response) {

        Claims claims;
        //토큰 유효성 확인
        try {
            claims = jwtTokenizer.getClaims(refreshToken).getPayload();
        } catch (JwtException e) {
            throw new LogicException(ExceptionCode.TOKEN_ERROR);
        }

        //토큰 타입 확인
        String type = claims.get("type", String.class);
        if (!"refresh".equals(type)) {
            throw new LogicException(ExceptionCode.TOKEN_ERROR);
        }

        String newAccessToken =
                jwtTokenizer.generateAccessToken(claims, claims.getSubject());

        String newRefreshToken =
                jwtTokenizer.generateRefreshToken(claims.getSubject());

        ResponseCookie cookie = ResponseCookie.from(
                        "refreshToken",
                        newRefreshToken
                )
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(60 * 60 * 24 * 14)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        return new TokenResponseDto(newAccessToken);
    }
}