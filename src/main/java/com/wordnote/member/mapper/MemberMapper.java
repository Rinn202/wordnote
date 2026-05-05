package com.wordnote.member.mapper;

import com.wordnote.board.entity.Board;
import com.wordnote.member.dto.request.MemberCreateDto;
import com.wordnote.member.dto.request.MemberUpdateDto;
import com.wordnote.member.dto.response.MemberResponseDto;
import com.wordnote.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MemberMapper {
    //members -> dtos
    public List<MemberResponseDto> toResponseDto(List<Member> members) {

        if (members == null) return List.of();

        return members.stream()
                .map(this::toResponseDto)
                .toList();
    }

    //member -> dto
    public MemberResponseDto toResponseDto(Member member) {


        return MemberResponseDto.builder()
                .nickname(member.getNickname())
                .email(member.getEmail())
                .password(member.getPassword())
                .createdAt(member.getCreatedAt())
                .boardIds(member.getBoards().stream().map(Board::getBoardId).toList())
                .build();
    }

    //createDto -> member
    public Member CreateToMember(MemberCreateDto dto) {
        return Member.builder()
                .name(dto.getName())
                .nickname(dto.getNickname())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .build();
    }

    //patchDto -> member
    public Member PatchToMember(MemberUpdateDto memberUpdateDto) {
        return Member.builder()
                .nickname(memberUpdateDto.getNickname())
                .email(memberUpdateDto.getEmail())
                .password(memberUpdateDto.getPassword())
                .build();
    }
}
