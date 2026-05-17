package com.wordnote.auth.handler;

import com.wordnote.auth.utils.JwtTokenizer;
import com.wordnote.domain.member.service.MemberService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
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
        //인증유저 정보 호출
        var oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = (String) oAuth2User.getAttributes().get("email");

        //토큰 생성
        String accessToken = delegateAccessToken(email);
        String refreshToken = delegateRefreshToken(email);

        //RefreshToken DB save
        memberService.updateRefreshToken(email, refreshToken);

        //리다이렉트 URI 로직
        String uri = createURI(accessToken, refreshToken).toString();
        getRedirectStrategy().sendRedirect(request, response, uri);
        System.out.println(uri);
    }

    private String delegateAccessToken(String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", email);
        claims.put("roles", List.of("BASIC"));

        return jwtTokenizer.generateAccessToken(claims, email);
    }

    private String delegateRefreshToken(String email) {
        return jwtTokenizer.generateRefreshToken(email);
    }

    private URI createURI(String accessToken, String refreshToken) {
        return UriComponentsBuilder
                .fromUriString("http://localhost:5173/login-success")
                .queryParam("access_token", accessToken)
                .queryParam("refresh_token", refreshToken)
                .build()
                .toUri();
    }
}