package com.wordnote.workbox.entity;

import com.wordnote.task.entity.Task;
import com.wordnote.board.entity.Board;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Getter
@Entity
public class WorkBox {

    @Id
    @Column(name = "boxId", updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.AUTO) //pk 자동생성
    private Long boxId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boardId") //리스트id로 리스트를 매핑 함
    private Board board;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column //북마크
    private Boolean bookmark;

    @OneToOne(mappedBy = "workBox") //블록은 박스에게 매핑당함
    private Task task;

    @Column
    private Long alarmId;

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

}

