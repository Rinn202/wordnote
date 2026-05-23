package com.wordnote.domain.task.entity;

import com.wordnote.domain.boxtask.entity.BoxTask;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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

    public Task(long memberId, @NotBlank String name, String category, String info) {
        this.name = name;
        this.memberId = memberId;
        if (category != null) this.category = category;
        if (info != null) this.info = info;
    }

    public void update(@NotBlank String name, String category, String info) {
        this.name = name;
        if (category != null) this.category = category;
        if (info != null) this.info = info;
    }
}

