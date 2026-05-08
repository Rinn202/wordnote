package com.wordnote.domain.box.entity;

import com.wordnote.domain.board.entity.Board;
import com.wordnote.domain.boxtask.BoxTask;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Getter
@Entity
public class Box {

    @Id
    @Column(name = "boxId", updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY) //pk 자동생성
    private Long boxId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boardId") //리스트id로 리스트를 매핑 함
    private Board board;

    @Builder.Default
    @Column //북마크
    private Boolean bookmark = false;

    @Column
    private Integer sortIndex;

    @OneToMany(mappedBy = "box", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BoxTask> boxTasks;

    @Column //만료시간
    private LocalTime expireTime;

    @Builder.Default //알람설정시간
    @Enumerated(EnumType.STRING)
    private AlarmType alarmType = AlarmType.NONE;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private State state = State.READY;

    @Column //생성일자
    @CreationTimestamp
    private LocalDateTime createdAt;

    public void setBoard(Board board) {
        if (this.board != null) {
            this.board.getBoxes().remove(this);
        }
        this.board = board;
        if (board != null && !board.getBoxes().contains(this)) {
            board.getBoxes().add(this);
        }
    }

    public void changeState(State next) {
        if (!this.state.canMoveTo(next)) {
            throw new IllegalStateException("invalid transition");
        }
        this.state = next;
    }

    public void update(Boolean bookmark,
                       AlarmType alarmType,
                       LocalTime expireTime,
                       Integer sortIndex) {

        if (bookmark != null) this.bookmark = bookmark;
        if (alarmType != null) this.alarmType = alarmType;
        if (expireTime != null) this.expireTime = expireTime;
        if (sortIndex != null) this.sortIndex = sortIndex;
    }
//
//    public void update(Board board, List<Task> tasks) {
//        if (board != null) this.board = board;
//        if (tasks != null) this.tasks = tasks;
//    }
//
//    public void setTasks(List<Task> tasks) {
//        if (tasks != null) this.tasks = tasks;
//    }

    public void setBoxTasks(List<BoxTask> relations) {
        if (relations != null) this.boxTasks = relations;
    }
}


