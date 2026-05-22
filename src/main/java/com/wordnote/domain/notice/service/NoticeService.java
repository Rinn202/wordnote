package com.wordnote.domain.notice.service;

import com.wordnote.domain.notice.entity.Notice;
import com.wordnote.domain.notice.repository.NoticeRepository;
import com.wordnote.exception.ExceptionCode;
import com.wordnote.exception.LogicException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class NoticeService {
    private final NoticeRepository noticeRepository;

    //전체 조회
    public List<Notice> findAll() {
        return noticeRepository.findAllByOrderByCreatedAtDesc();
    }

    public Notice findById(long noticeId) {
        return noticeRepository.findById(noticeId)
                .orElseThrow(() -> new LogicException(ExceptionCode.NOTICE_NOT_FOUND));
    }

    //생성
    @Transactional
    public Notice createNotice(Notice notice) {
        return noticeRepository.save(notice);
    }

    //수정
    @Transactional
    public Notice updateNotice(long noticeId, Notice requestNotice) {

        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new LogicException(ExceptionCode.TASK_NOT_FOUND));
        notice.update(requestNotice);

        return notice;
    }

    //삭제
    @Transactional
    public void deleteNotice(long noticeId) {
        noticeRepository.deleteById(noticeId);
    }


}
