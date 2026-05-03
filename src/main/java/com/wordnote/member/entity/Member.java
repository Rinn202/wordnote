package com.wordnote.member.entity;

import com.wordnote.board.entity.Board;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
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

    @OneToMany(mappedBy = "member")
    List<Board> boards;


    public void update(String nickname, String password, String email, List<Board> boards) {
        this.nickname = nickname;
        this.password = password;
        this.email = email;

        this.boards.clear();

        if (boards != null) {
            boards.forEach(this::addBoard); //매핑 유지
        }
    }

    public void addBoard(Board board) {
        this.boards.add(board);
        board.assignMember(this);
    }
}
