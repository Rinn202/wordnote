package com.wordnote;

import com.wordnote.domain.task.dto.response.TaskResponseDto;
import com.wordnote.domain.task.entity.Task;
import com.wordnote.domain.task.repository.TaskRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class WordnoteApplication {

    public static void main(String[] args) {
        SpringApplication.run(WordnoteApplication.class, args);
    }

    // 스프링이 켜질 때 이 @Bean 메서드를 자동으로 실행해줍니다.
    @Bean
    public CommandLineRunner initData(TaskRepository taskRepository) {
        return args -> {
            // ID를 빼고 빌더로 데이터 생성 (아주 좋은 방향입니다!)
            Task task1 = Task.builder().name("투약").build();
            Task task2 = Task.builder().name("v/s").build();
            Task task3 = Task.builder().name("검사").build();
            Task task4 = Task.builder().name("I/O").build();
            Task task5 = Task.builder().name("물품 카운터").build();

            // saveAll은 List 형태로 인자를 받으므로 List.of()로 감싸서 저장합니다.
            taskRepository.saveAll(List.of(task1, task2, task3, task4, task5));

            System.out.println("── 더미 데이터 저장 완료! ──");
        };
    }
}