package com.wordnote.domain.task.controller;

import com.wordnote.auth.utils.SecurityUtil;
import com.wordnote.domain.task.dto.request.TaskCreateDto;
import com.wordnote.domain.task.dto.request.TaskUpdateDto;
import com.wordnote.domain.task.dto.response.TaskResponseDto;
import com.wordnote.domain.task.repository.TaskRepository;
import com.wordnote.domain.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/task")
public class TaskController {
    private final TaskService taskService;
    private final TaskRepository taskRepository;

    //전체조회
    @GetMapping
    public ResponseEntity<List<TaskResponseDto>> getAllTask() {

        long memberId = SecurityUtil.getMemberId();

        List<TaskResponseDto> response = taskService.findAllByMemberId(memberId);

        return ResponseEntity.ok(response);
    }

    //생성
    @PostMapping
    public ResponseEntity<TaskResponseDto> createTask(@RequestBody TaskCreateDto taskCreateDto) {
        long memberId = SecurityUtil.getMemberId();
        TaskResponseDto response = taskService.createTask(taskCreateDto, memberId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //수정
    @PatchMapping("/{taskId}")
    public ResponseEntity<TaskResponseDto> patchTask(@RequestBody TaskUpdateDto taskUpdateDto, @PathVariable long taskId) {
        long memberId = SecurityUtil.getMemberId();

        TaskResponseDto response = taskService.updateTask(taskId, taskUpdateDto, memberId);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    //삭제
    @DeleteMapping("/{taskId}")
    public ResponseEntity<TaskResponseDto> deleteTask(@PathVariable long taskId) {
        long memberId = SecurityUtil.getMemberId();

        taskService.deleteTask(taskId, memberId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
