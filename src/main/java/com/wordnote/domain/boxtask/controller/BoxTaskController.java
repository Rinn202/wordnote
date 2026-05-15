package com.wordnote.domain.boxtask.controller;

import com.wordnote.auth.utils.SecurityUtil;
import com.wordnote.domain.boxtask.dto.MoveTaskRequest;
import com.wordnote.domain.boxtask.entity.BoxTask;
import com.wordnote.domain.boxtask.service.BoxTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/boxTask")
public class BoxTaskController {
    private final BoxTaskService boxTaskService;

    //옵션 변경
    @PutMapping("/{boxTaskId}/move")
    public ResponseEntity<BoxTask> patchBoxTaskOption(@RequestBody MoveTaskRequest dto,
                                                      @PathVariable long boxTaskId) {
        long memberId = SecurityUtil.getMemberId();
        boxTaskService.changeIndex(boxTaskId, dto, memberId);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PatchMapping("/{boxTaskId}/done")
    public ResponseEntity<BoxTask> patchBoxTaskDone(@PathVariable long boxTaskId) {
        long memberId = SecurityUtil.getMemberId();
        boxTaskService.changeDone(boxTaskId);

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
