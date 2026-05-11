package com.wordnote.domain.boxtask.controller;

import com.wordnote.domain.boxtask.dto.MoveTaskRequest;
import com.wordnote.domain.boxtask.service.BoxTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/boxTask")
public class BoxTaskController {
    private final BoxTaskService boxTaskService;

    //박스테스크 리로더
    @PutMapping("/{boxTaskId}/move")
    public ResponseEntity<Void> PatchTaskSort(@PathVariable Long boxTaskId,
                                              @RequestBody MoveTaskRequest request) {
        boxTaskService.moveTask(request, boxTaskId);
        return ResponseEntity.ok().build();
    }

    //done 처리
    @PatchMapping("/{boxTaskId}/state")
    public ResponseEntity<Void> PatchBoxTaskState(@PathVariable long boxTaskId) {
        boxTaskService.changeState(boxTaskId);

        return ResponseEntity.ok().build();
    }
}
