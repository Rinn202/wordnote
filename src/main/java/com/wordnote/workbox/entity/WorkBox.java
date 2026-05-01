package com.wordnote.workbox.entity;

import com.wordnote.workblock.entity.WorkBlock;
import com.wordnote.boxlist.entity.BoxList;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Getter
@Entity
public class WorkBox {

    @Id
    @Column(name = "work_box_id", updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.AUTO) //pk 자동생성
    private Long workBoxId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "box_list_id") //리스트id로 리스트를 매핑 함
    private BoxList boxList;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column //북마크
    private Boolean bookmark;

    @OneToOne(mappedBy = "workBox") //블록은 박스에게 매핑당함
    private WorkBlock block;

    @Column
    private Long alarmId;

    @Column //알람설정시간
    private LocalDateTime alarmTime;

    @Column //만료시간
    private LocalDateTime expiredAt;

    @Column //생성일자
    @CreationTimestamp
    private LocalDateTime createdAt;

}

