package com.wordnote.domain.workboxtask;

import com.wordnote.domain.task.entity.Task;
import com.wordnote.domain.workbox.entity.WorkBox;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class WorkBoxTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long workBoxTaskId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workBoxId")
    private WorkBox workBox;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "taskId")
    private Task task;

    private int sortIndex;
}

