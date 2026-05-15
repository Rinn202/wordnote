package com.wordnote.domain.task.controller;

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


    //id로 조회
    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponseDto> getTaskById(@PathVariable long taskId) {

        TaskResponseDto response = taskService.findById(taskId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TaskResponseDto>> getAllTask() {

        List<TaskResponseDto> response = taskService.findAll();
        return ResponseEntity.ok(response);
    }

    //생성
    @PostMapping
    public ResponseEntity<TaskResponseDto> createTask(@RequestBody TaskCreateDto taskCreateDto) {
        TaskResponseDto response = taskService.createTask(taskCreateDto);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //수정
    @PatchMapping("/{taskId}")
    public ResponseEntity<TaskResponseDto> patchTask(@RequestBody TaskUpdateDto taskUpdateDto,
                                                     @PathVariable long taskId) {
        TaskResponseDto response = taskService.updateTask(taskId, taskUpdateDto);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //삭제
    @DeleteMapping("/{taskId}")
    public ResponseEntity<TaskResponseDto> deleteTask(@PathVariable long taskId) {
        taskService.deleteTask(taskId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
