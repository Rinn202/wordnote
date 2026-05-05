package com.wordnote.workbox.entity;

import com.wordnote.board.entity.Board;
import com.wordnote.workboxtask.WorkBoxTask;
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
public class WorkBox {

    @Id
    @Column(name = "boxId", updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY) //pk 자동생성
    private Long boxId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boardId") //리스트id로 리스트를 매핑 함
    private Board board;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private Status status = Status.READY;

    @Builder.Default
    @Column //북마크
    private Boolean bookmark = false;

    @Column
    private Integer sortIndex;

    @OneToMany(mappedBy = "workBox", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkBoxTask> workBoxTasks;

    @Column //알람설정시간
    private LocalDateTime alarmTime;

    @Column //만료시간
    private LocalDateTime expiredAt;

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

    public void changeStatus(Status next) {
        if (!this.status.canMoveTo(next)) {
            throw new IllegalStateException("invalid transition");
        }
        this.status = next;
    }

    public void update(Status status,
                       Boolean bookmark,
                       LocalDateTime alarmTime,
                       LocalDateTime expiredAt,
                       Integer sortIndex) {

        if (status != null) this.status = status;
        if (bookmark != null) this.bookmark = bookmark;
        if (alarmTime != null) this.alarmTime = alarmTime;
        if (expiredAt != null) this.expiredAt = expiredAt;
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

    public void setWorkBoxTasks(List<WorkBoxTask> relations) {
        if (relations != null) this.workBoxTasks = relations;
    }
}


