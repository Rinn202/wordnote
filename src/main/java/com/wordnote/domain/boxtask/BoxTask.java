package com.wordnote.domain.boxtask;

import com.wordnote.domain.box.entity.Box;
import com.wordnote.domain.task.entity.Task;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
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

    private int sortIndex;
}

