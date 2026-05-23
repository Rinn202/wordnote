package com.wordnote.auth.handler;

import com.wordnote.auth.utils.JwtTokenizer;
import com.wordnote.domain.member.entity.Member;
import com.wordnote.domain.member.service.MemberService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2MemberSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtTokenizer jwtTokenizer;
    private final MemberService memberService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        //인증 유저 정보
        var oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = (String) oAuth2User.getAttributes().get("email");

        String accessToken = delegateAccessToken(email);
        String refreshToken = delegateRefreshToken(email);

        //RefreshToken DB 저장
        memberService.updateRefreshToken(email, refreshToken);

        //응답 헤더에 쿠키주기
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // 로컬 환경용
                .sameSite("Lax")
                .path("/")
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        //AccessToken 파라미터 리다이렉트
        String uri = createURI(accessToken).toString();

        //브라우저 이동
        getRedirectStrategy().sendRedirect(request, response, uri);
    }

    private String delegateAccessToken(String email) {
        Member member = memberService.findByEmail(email);

        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("memberId", member.getMemberId());
        claims.put("role", member.getRole());
        return jwtTokenizer.generateAccessToken(claims, email);
    }

    private String delegateRefreshToken(String email) {
        return jwtTokenizer.generateRefreshToken(email);
    }

    private URI createURI(String accessToken) {
        return UriComponentsBuilder
                .fromUriString("https://wordnote-production.up.railway.app/oauth2/redirect") // 리다이렉트 전용 경로 추천
                .queryParam("access_token", accessToken)
                .build()
                .toUri();
    }
}