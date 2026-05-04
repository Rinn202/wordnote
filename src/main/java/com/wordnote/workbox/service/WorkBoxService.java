package com.wordnote.workbox.service;

import com.wordnote.task.entity.Task;
import com.wordnote.task.service.TaskService;
import com.wordnote.workbox.dto.request.WorkBoxOptionPatchDto;
import com.wordnote.workbox.dto.request.WorkBoxPostDto;
import com.wordnote.workbox.dto.response.WorkBoxContentResponseDto;
import com.wordnote.workbox.entity.Status;
import com.wordnote.workbox.entity.WorkBox;
import com.wordnote.workbox.mapper.WorkBoxMapper;
import com.wordnote.workbox.repository.WorkBoxRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class WorkBoxService {
    private final WorkBoxRepository workBoxRepository;
    private final WorkBoxMapper workBoxMapper;
    private final TaskService taskService;

    //박스추가
    public WorkBox createWorkBox(WorkBoxPostDto postDto) {

        Integer max = workBoxRepository.findMaxSortIndex();

        Task task = taskService.findById(postDto.getTaskId());

        WorkBox newBox = WorkBox.builder()
                .sortIndex(max + 1)
                .task(task)
                .build();

        return workBoxRepository.save(newBox);
    }

    //옵션변경
    public WorkBox changeOption(long boxId, WorkBoxOptionPatchDto requestOption) {
        WorkBox foundBox = workBoxRepository.findById(boxId)
                .orElseThrow(() -> new EntityNotFoundException("WorkBox not found"));

        WorkBox updateWorkBox = workBoxMapper.patchToWorkBoxOption(requestOption, foundBox); // 기존 엔티티에 덮어쓰기

        return workBoxRepository.save(updateWorkBox);
    }

    //테스크 변경
    public WorkBox updateTask(long boxId, WorkBoxContentResponseDto dto) {
        WorkBox box = workBoxRepository.findById(boxId)
                .orElseThrow(() -> new EntityNotFoundException("WorkBox not found"));

        workBoxMapper.patchToWorkBoxByBoard(dto, box); // 기존 엔티티에 덮어쓰기
        return workBoxRepository.save(box);
    }

    public WorkBox findById(Long boxId) {
        return workBoxRepository.findById(boxId)
                .orElseThrow(() -> new RuntimeException("WorkBoxMapper not found: " + boxId));
    }

    public WorkBox changeStatus(long boxId, Status next) {

        WorkBox box = workBoxRepository.findById(boxId).orElseThrow();
        box.changeStatus(next);

        return workBoxRepository.save(box);
    }

    public void deleteWorkBox(Long boxId) {
        workBoxRepository.deleteById(boxId);
    }
}
