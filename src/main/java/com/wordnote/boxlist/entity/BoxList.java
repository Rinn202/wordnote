package com.wordnote.boxlist.entity;

import com.wordnote.member.entity.Member;
import com.wordnote.workbox.entity.WorkBox;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Getter
@Entity
@Table(name = "box_list")
public class BoxList {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "box_list_id")
    private Long boxListId;

    @Column
    @Enumerated(EnumType.STRING)
    private Type type;

    @Column
    private Integer sortIndex = 1;

    @OneToMany(mappedBy = "boxList") //리스트에게 매핑당함
    List<WorkBox> workBoxs;

    @ManyToOne
    @JoinColumn(name = "member_id", updatable = false, nullable = false)
    Member member;

}

