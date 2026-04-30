package com.wordnote.workblock.entity;

import com.wordnote.workbox.entity.WorkBox;
import jakarta.persistence.*;

@Entity
public class WorkBlock {
    @Id
    @Column(name = "block_id", updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long blockId;

    @Column(nullable = false) //액션명
    private String name;


    @OneToOne //블록 id로 매핑함
    @JoinColumn(name = "work_box_id", unique = true)
    private WorkBox workBox;
}

