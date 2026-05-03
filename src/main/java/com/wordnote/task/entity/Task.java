package com.wordnote.task.entity;

import com.wordnote.workbox.entity.WorkBox;
import jakarta.persistence.*;
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

    @OneToOne
    @JoinColumn(name = "boxId", unique = true)
    private WorkBox box;

    public void update(String name, WorkBox box) {
        if (name != null) this.name = name;
        if (box != null) this.box = box;
    }
}

