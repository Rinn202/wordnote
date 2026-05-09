package com.wordnote.domain.task.entity;

import com.wordnote.domain.boxtask.BoxTask;
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
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "taskId", updatable = false, nullable = false)
    private Long taskId;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "task")
    private List<BoxTask> boxTasks = new ArrayList<>();

    public void update(String name) {
        if (name != null) this.name = name;
    }
}

