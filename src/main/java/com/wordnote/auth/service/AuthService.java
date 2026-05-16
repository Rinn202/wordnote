package com.wordnote.auth.service;

import com.wordnote.auth.dto.LoginResponseDto;
import com.wordnote.auth.utils.JwtTokenizer;
import com.wordnote.domain.member.entity.Member;
import com.wordnote.domain.member.repository.MemberRepository;
import com.wordnote.exception.ExceptionCode;
import com.wordnote.exception.LogicException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    public LoginResponseDto login(String email, String password) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new LogicException(ExceptionCode.INVALID_LOGIN_ATTEMPT)); //유저검색

        if (!passwordEncoder.matches(password, member.getPassword())) {
            log.warn("로그인 실패: 비밀번호 불일치 - Email: {}", email);
            throw new LogicException(ExceptionCode.INVALID_LOGIN_ATTEMPT); //패스워드 확인(인코더 매칭)
        }

        Map<String, Object> claims = new HashMap<>();//토큰정보 생성
        claims.put("memberRole", member.getRole());
        claims.put("memberId", member.getMemberId());
        claims.put("email", member.getEmail());

        String subject = member.getEmail(); //토큰 생성
        String accessToken = jwtTokenizer.generateAccessToken(claims, subject);
        String refreshToken = jwtTokenizer.generateRefreshToken(subject);

        return new LoginResponseDto(accessToken, refreshToken, member.getNickname());
    }
}