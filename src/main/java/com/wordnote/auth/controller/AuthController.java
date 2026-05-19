package com.wordnote.auth.controller;

import com.wordnote.auth.dto.LoginDto;
import com.wordnote.auth.dto.LoginResponseDto;
import com.wordnote.auth.dto.TokenResponseDto;
import com.wordnote.auth.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto,
                                   HttpServletResponse servletResponse) {
        LoginResponseDto response = authService.login(loginDto.getEmail(), loginDto.getPassword(), servletResponse);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDto> refresh(
            @CookieValue(name = "refreshToken") String refreshToken,
            HttpServletResponse response
    ) {

        TokenResponseDto tokenResponse =
                authService.refresh(refreshToken, response);

        return ResponseEntity.ok(tokenResponse);
    }
}
