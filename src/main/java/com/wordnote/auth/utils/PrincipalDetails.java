package com.wordnote.auth.utils;

import com.wordnote.domain.member.entity.Member;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

@Data
public class PrincipalDetails implements UserDetails, OAuth2User {

    private final Member member;
    private Map<String, Object> attributes;

    // 일반 로그인(Form Login)할 때 사용하는 생성자
    public PrincipalDetails(Member member) {
        this.member = member;
    }

    // OAuth2 구글 로그인할 때 사용하는 생성자
    public PrincipalDetails(Member member, Map<String, Object> attributes) {
        this.member = member;
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    // 구글이 제공하는 고유 ID 식별자(sub)를 반환하거나 member의 pk를 반환합니다.

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> collect = new ArrayList<>();
        collect.add((GrantedAuthority) () -> member.getRole().name());
        return collect;
    }

    @Override
    public String getPassword() {
        return member.getPassword();
    }

    @Override
    public String getName() {
        return String.valueOf(member.getMemberId()); // 예: "1", "2" 리턴
    }

    @Override
    public String getUsername() {
        return member.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // 계정 만료 여부 (true: 만료 안됨)
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // 계정 잠김 여부 (true: 잠기지 않음)
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 비밀번호 만료 여부 (true: 만료 안됨)
    }

    @Override
    public boolean isEnabled() {
        return true; // 계정 활성화 여부 (true: 활성화)
    }
}