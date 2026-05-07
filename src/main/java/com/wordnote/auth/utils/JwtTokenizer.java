package com.wordnote.auth.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Calendar;
import java.util.Date;
import java.util.Map;

@Getter
@Component
public class JwtTokenizer {

    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.access-token-expiration-minutes}")
    private int accessTokenExpirationMinutes;

    @Value("${jwt.refresh-token-expiration-minutes}")
    private int refreshTokenExpirationMinutes;

    //SecretKey 생성 (암호화)
    public SecretKey getKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    //AccessToken 생성
    public String generateAccessToken(Map<String, Object> claims, String subject, int expirationMinutes) {

        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MINUTE, expirationMinutes);
        Date expiration = calendar.getTime();

        // 2. 키 가져오기 (기존에 만든 getKey 메서드 활용)
        Key key = getKey();

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(Calendar.getInstance().getTime())
                .expiration(expiration)
                .signWith(getKey())
                .compact();
    }

    // 3. RefreshToken 생성 (claims x, 보안상)
    public String generateRefreshToken(String subject, Date expiration) {
        return Jwts.builder()
                .subject(subject)
                .issuedAt(Calendar.getInstance().getTime())
                .expiration(expiration)
                .signWith(getKey())
                .compact();
    }

    //토큰 파싱(추출)
    public Jws<Claims> getClaims(String jws) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(jws);    //(변조, 만료 확인후 Claims 반환)
    }

    // 만료 시간 계산 유틸리티
    public Date getTokenExpiration(int expirationMinutes) {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MINUTE, expirationMinutes);
        return calendar.getTime();
    }
}