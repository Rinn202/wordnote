package com.wordnote.task.controller;

import com.wordnote.board.entity.Type;
import com.wordnote.task.dto.request.TaskCreateDto;
import com.wordnote.task.dto.request.TaskPatchDto;
import com.wordnote.task.dto.response.TaskResponseDto;
import com.wordnote.task.entity.Task;
import com.wordnote.task.mapper.TaskMapper;
import com.wordnote.task.repository.TaskRepository;
import com.wordnote.task.service.TaskService;
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
    private final TaskMapper taskMapper;
    private final TaskRepository taskRepository;


    //id로 조회
    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponseDto> getTaskById(@RequestParam(required = false) Type type,
                                                       @PathVariable long taskId) {

        Task task = taskService.findById(taskId);
        TaskResponseDto response = taskMapper.toResponseDto(task);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TaskResponseDto>> getAllTask(@RequestParam(required = false) Type type,
                                                            @RequestParam(defaultValue = "asc") String sort) {

        List<Task> taskList = taskRepository.findAll();
        List<TaskResponseDto> response = taskMapper.toResponseDtos(taskList);
        return ResponseEntity.ok(response);
    }

    //생성
    @PostMapping
    public ResponseEntity<TaskResponseDto> createTask(@RequestParam(required = false) Type type,
                                                      @RequestBody TaskCreateDto taskCreateDto) {
        TaskResponseDto response = taskService.createTask(taskCreateDto);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //수정
    @PatchMapping("/{taskId}")
    public ResponseEntity<TaskResponseDto> patchTask(@RequestParam(required = false) Type type,
                                                     @RequestBody TaskPatchDto taskPatchDto,
                                                     @PathVariable long taskId) {
        Task task = taskService.updateTask(taskId, taskPatchDto);
        TaskResponseDto response = taskMapper.toResponseDto(task);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //삭제
    @DeleteMapping("/{taskId}")
    public ResponseEntity<TaskResponseDto> deleteTask(@RequestParam(required = false) Type type,
                                                      @PathVariable long taskId) {
        taskService.deleteTask(taskId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
