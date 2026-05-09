package com.wordnote.domain.member.entity;

import com.wordnote.domain.board.entity.Board;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Getter
@Entity
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "memberId")
    private Long memberId;

    @Builder.Default
    private String profileImageUrl = "https://your-domain.com/default-profile.png";

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column
    MemberRole role = MemberRole.BASIC;

    @Column(nullable = false, updatable = false)
    private String name;

    @Column(nullable = false)
    private String nickname;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column
    String refreshToken;

    @Builder.Default
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Board> boards = new ArrayList<>();

    //구글 인증용 생성자
    public Member(String email, String name, String password, String profileImageUrl) {
        this.email = email;
        this.name = name;
        this.nickname = name;
        this.password = password;
        this.profileImageUrl = profileImageUrl;
    }

    public void update(String nickname, String password, String email) {
        this.nickname = nickname;
        this.password = password;
        this.email = email;
    }

    public void encryptPassword(String encryptedPassword) {
        if (encryptedPassword != null)
            this.password = encryptedPassword;
    }

    public void setRole(MemberRole memberRole) {
        if (memberRole != null)
            this.role = memberRole;
    }

    public void setRefreshToken(String refreshToken) {
        if (refreshToken != null)
            this.refreshToken = refreshToken;
    }
}
