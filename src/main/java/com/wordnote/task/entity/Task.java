package com.wordnote.task.entity;

import com.wordnote.workbox.entity.WorkBox;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

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

    @Builder.Default
    @Column
    private Integer sortIndex = 0;

    @OneToOne(mappedBy = "task")
    private WorkBox workBox;

    public void update(String name, @NotNull Integer sortIndex) {
        if (name != null) this.name = name;
        if (sortIndex != null) this.sortIndex = sortIndex;
    }
}

