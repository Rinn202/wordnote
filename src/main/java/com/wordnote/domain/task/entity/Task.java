package com.wordnote.domain.task.entity;

import com.wordnote.domain.boxtask.entity.BoxTask;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Getter
@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "taskId", updatable = false, nullable = false)
    private Long taskId;

    @Column(nullable = false)
    private String name;

    @Column
    private String info;

    @OneToMany(mappedBy = "task")
    private List<BoxTask> boxTasks = new ArrayList<>();

    @Column
    private Long memberId;

    @Column
    private String category;

    public Task(Long memberId, String name) {
        this.memberId = memberId;
        this.name = name;
    }

    public void update(String name) {
        if (name != null) this.name = name;
    }


}

