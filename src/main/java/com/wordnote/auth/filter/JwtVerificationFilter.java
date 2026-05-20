package com.wordnote.auth.filter;

import com.wordnote.auth.utils.JwtTokenizer;
import com.wordnote.auth.utils.PrincipalDetails;
import com.wordnote.domain.member.entity.Member;
import com.wordnote.domain.member.entity.Role;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
public class JwtVerificationFilter extends OncePerRequestFilter { // 요청당 한 번만 실행

    private final JwtTokenizer jwtTokenizer;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            Map<String, Object> claims = verifyJws(request);    //헤더에서 토큰 파싱
            setAuthenticationToContext(claims); //검증 성공시 SecurityContext에 인증 정보 저장
        } catch (Exception e) {
            request.setAttribute("exception", e); //실패시
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");  //헤더의 Authorization: Bearer {token} 확인
        return authorization == null || !authorization.startsWith("Bearer");
    }

    private Map<String, Object> verifyJws(HttpServletRequest request) {
        String jws = request.getHeader("Authorization").replace("Bearer ", "");
        return jwtTokenizer.getClaims(jws).getPayload(); //있으면 해당 값으로 토큰 생성. payload(=body)
    }

    private void setAuthenticationToContext(Map<String, Object> claims) {

        Long memberId = Long.parseLong(String.valueOf(claims.get("memberId")));
        String email = String.valueOf(claims.get("email"));
        String role = String.valueOf(claims.get("role"));

        Member member = Member.builder()
                .memberId(memberId)
                .email(email)
                .role(Role.BASIC)
                .build();

        //SecurityUtil 연계용 클래스
        PrincipalDetails principalDetails = new PrincipalDetails(member);

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principalDetails,
                null,
                authorities
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

}