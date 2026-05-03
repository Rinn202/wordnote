package com.wordnote.task.controller;

import com.wordnote.board.entity.Type;
import com.wordnote.task.dto.request.TaskPatchDto;
import com.wordnote.task.dto.request.TaskPostDto;
import com.wordnote.task.dto.response.TaskResponseDto;
import com.wordnote.task.entity.Task;
import com.wordnote.task.mapper.TaskMapper;
import com.wordnote.task.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/task")
public class TaskController {
    TaskService taskService;
    TaskMapper taskMapper;


    //박스로 조회
    @GetMapping("/{boxId}")
    public ResponseEntity<TaskResponseDto> getTaskById(@RequestParam(required = false) Type type,
                                                        @RequestParam(defaultValue = "asc") String sort,
                                                             @PathVariable long boxId) {

        Task task = taskService.findByWorKBoxId(boxId);
        TaskResponseDto response = taskMapper.toResponseDto(task);
        return ResponseEntity.ok(response);
    }

    //생성
    @PostMapping
    public ResponseEntity<TaskResponseDto> createTask(@RequestParam(required = false) Type type,
                                                           @RequestBody TaskPostDto taskPostDto) {
        Task savedTask = taskService.createTask(taskPostDto) ;
        TaskResponseDto response = taskMapper.toResponseDto(savedTask);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping("/{taskId}")
    public ResponseEntity<TaskResponseDto> patchTask(@RequestParam(required = false) Type type,
                                                     @RequestBody TaskPatchDto taskPatchDto,
                                                     @PathVariable long taskId) {
        Task savedTask = taskService.updateTask(taskId, taskPatchDto);
        TaskResponseDto response = taskMapper.toResponseDto(savedTask);

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
