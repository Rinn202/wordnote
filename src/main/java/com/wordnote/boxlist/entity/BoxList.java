package com.wordnote.boxlist.entity;

import com.wordnote.member.entity.Member;
import com.wordnote.workbox.entity.WorkBox;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import jakarta.persistence.*;

import java.util.List;

@Table(name = "box_list")
@Entity
public class BoxList {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "box_list_id")
    private Long boxListId;

    @Column
    @Enumerated(EnumType.STRING)
    private Type type;

    @Column(name = "list_order")
    private Integer order;

    @OneToMany(mappedBy = "boxList") //리스트에게 매핑당함
    @Column
    List<WorkBox> workBoxs;

    @ManyToOne
    @JoinColumn(name = "member_id", updatable = false, nullable = false)
    Member member;

}

enum Type {routine, event}
