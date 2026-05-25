package com.wordnote.domain.notice.controller;

import com.wordnote.domain.notice.entity.Notice;
import com.wordnote.domain.notice.service.NoticeService;
import jakarta.annotation.security.RolesAllowed;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequiredArgsConstructor
@RolesAllowed("ADMIN")
@RequestMapping("/notice")
public class NoticeController {
    private final NoticeService NoticeService;

    @GetMapping
    public ResponseEntity<List<Notice>> getAllNotice() {
        List<Notice> response = NoticeService.findAll();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{noticeId}")
    public ResponseEntity<Notice> getNotice(@PathVariable long noticeId) {
        Notice response = NoticeService.findById(noticeId);

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Notice> createNotice(@RequestBody Notice notice) {
        Notice response = NoticeService.createNotice(notice);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{noticeId}")
    public ResponseEntity<Notice> patchNotice(@RequestBody Notice notice,
                                              @PathVariable long noticeId) {
        Notice response = NoticeService.updateNotice(noticeId, notice);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{noticeId}")
    public ResponseEntity<Notice> deleteNotice(@PathVariable long noticeId) {
        NoticeService.deleteNotice(noticeId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
