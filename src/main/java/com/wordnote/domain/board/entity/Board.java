package com.wordnote.domain.board.entity;

import com.wordnote.domain.box.entity.Box;
import com.wordnote.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Getter
@Entity
@Table(name = "board")
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "boardId")
    private Long boardId;

    @Column
    @Enumerated(EnumType.STRING)
    private Type type;

    @Builder.Default
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Box> boxes = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "memberId", updatable = false, nullable = false)
    Member member;


    //List<BoxMapper> 교체, 매핑 유지
    public void update(Type type) {
        if (type != null) this.type = type;
    }

    public void assignMember(Member member) {
        this.member = member;
    }

}

