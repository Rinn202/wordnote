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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

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
                .csrf(csrf -> csrf.disable()) //cors
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .headers(headers ->
                        headers.frameOptions(frame -> frame.sameOrigin()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers("/auth/**", "/member/signup").permitAll()
                                .requestMatchers("/h2-console/**").permitAll()

                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() //OPTIONS 메서드 허용 (CORS Preflight 대응)
//
//                        .requestMatchers(HttpMethod.GET, "/member").hasRole("ADMIN")
//                        .requestMatchers(HttpMethod.GET, "/box").hasRole("ADMIN")
//                        .requestMatchers(HttpMethod.GET, "/board").hasRole("ADMIN")

                                .anyRequest().authenticated()
                )
                .addFilterBefore(new JwtVerificationFilter(jwtTokenizer), UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(oAuth2UserService))
                        .successHandler(oAuth2MemberSuccessHandler)
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Refresh"));
        configuration.setAllowCredentials(true); //쿠키

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 경로에 적용
        return source;
    }
}