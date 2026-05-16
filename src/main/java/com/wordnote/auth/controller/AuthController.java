package com.wordnote.auth.controller;

import com.wordnote.auth.dto.LoginDto;
import com.wordnote.auth.dto.LoginResponseDto;
import com.wordnote.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        LoginResponseDto response = authService.login(loginDto.getEmail(), loginDto.getPassword());

        // 관례적으로 토큰은 헤더에 Authorization: Bearer {token}으로 보냅니다.
        return ResponseEntity.ok(response);
    }
}
