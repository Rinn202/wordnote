package com.wordnote.domain.boxtask.entity;

import com.wordnote.domain.box.entity.Box;
import com.wordnote.domain.task.entity.Task;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class BoxTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long boxTaskId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boxId")
    private Box box;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "taskId")
    private Task task;

    @Builder.Default
    @Column
    private Boolean isDone = false;

    private int sortIndex;

    public void toggleDone(Boolean isDone) {
        this.isDone = !this.isDone;
    }

    public void resetDone() {
        this.isDone = false;
    }

}

