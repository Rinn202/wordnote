package com.wordnote.domain.box.dto.request;

import com.wordnote.domain.box.entity.BoxType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class BoxCreateDto {

    @NotBlank
    private long boardId;

    @NotBlank
    private List<Long> taskIds;

    @NotNull
    private BoxType boxType;

    private String name;
}