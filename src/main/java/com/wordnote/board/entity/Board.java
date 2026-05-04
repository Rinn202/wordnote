package com.wordnote.board.entity;

import com.wordnote.member.entity.Member;
import com.wordnote.workbox.entity.WorkBox;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import jakarta.persistence.*;
import lombok.*;

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

    @OneToMany(mappedBy = "board") //리스트에게 매핑당함
    List<WorkBox> boxes;

    @ManyToOne
    @JoinColumn(name = "memberId", updatable = false, nullable = false)
    Member member;


//List<WorkBoxMapper> 교체, 매핑 유지
    public void update(Type type, List<WorkBox> boxes) {
        if (type != null) this.type = type;

        if (boxes != null) {
            this.boxes.clear();
            boxes.forEach(this::addBox);
        }
    }

    //
    public void addBox(WorkBox box) {
        if (box == null) return;

        if (box.getBoard() != null && box.getBoard() != this) {
            box.getBoard().boxes.remove(box);
        }

        if (!this.boxes.contains(box)) {
            this.boxes.add(box);
        }

        box.setBoard(this);
    }

    public void assignMember(Member member) {
        this.member = member;
    }
}

