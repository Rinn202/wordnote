package com.wordnote.task.entity;

import com.wordnote.workbox.entity.WorkBox;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

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

    @Builder.Default
    @Column
    private Integer sortIndex = 0;

    @ManyToMany(mappedBy = "tasks")
    private List<WorkBox> workBoxes;

    public void update(String name, @NotNull Integer sortIndex) {
        if (name != null) this.name = name;
        if (sortIndex != null) this.sortIndex = sortIndex;
    }

    public void setWorkBox(List<WorkBox> boxes) {
        if (boxes != null) this.workBoxes = boxes;
    }

    //복제
    public Task copyForWorkBox(List<WorkBox> boxes) {
        return Task.builder()
                .name(this.name)
                .sortIndex(this.sortIndex)
                .workBoxes(boxes)
                .build();
    }
}

