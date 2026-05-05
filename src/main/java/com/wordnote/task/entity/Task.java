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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boxId")
    private WorkBox workBox;

    public void update(String name, @NotNull Integer sortIndex) {
        if (name != null) this.name = name;
        if (sortIndex != null) this.sortIndex = sortIndex;
    }

    public void setWorkBox(WorkBox box) {
        if(box != null) this.workBox = box;
    }

    //복제
    public Task copyForWorkBox(WorkBox workBox) {
        return Task.builder()
                .name(this.name)
                .sortIndex(this.sortIndex)
                .workBox(workBox)
                .build();
    }
}

