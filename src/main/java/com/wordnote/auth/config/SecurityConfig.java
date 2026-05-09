package com.wordnote.auth.config;

import com.wordnote.auth.filter.JwtVerificationFilter;
import com.wordnote.auth.handler.OAuth2MemberSuccessHandler;
import com.wordnote.auth.service.CustomOAuth2UserService;
import com.wordnote.auth.utils.JwtTokenizer;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenizer jwtTokenizer;
    private final CustomOAuth2UserService oAuth2UserService;
    private final OAuth2MemberSuccessHandler oAuth2MemberSuccessHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // REST API이므로 csrf 보안은 비활성화
                .headers(headers ->
                        headers.frameOptions(frame -> frame.sameOrigin())) // H2 콘솔 사용
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션 사용 X (JWT 방식)
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers("/auth/**", "/member/signup").permitAll() // 로그인, 회원가입 등은 허용
                                .requestMatchers("/h2-console/**").permitAll() // 로그인, 회원가입 등은 허용

                                .requestMatchers(HttpMethod.GET, "/member").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.GET, "/box").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.GET, "/board").hasRole("ADMIN")

                                .anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
//                        .anyRequest().permitAll() // 모든 요청을 조건 없이 허용(test)
                )
                .addFilterBefore(new JwtVerificationFilter(jwtTokenizer), UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(oAuth2UserService))
                        .successHandler(oAuth2MemberSuccessHandler)
                );

        return http.build();
    }
}