package com.wordnote.member.mapper;

import com.wordnote.board.entity.Board;
import com.wordnote.member.dto.request.MemberCreateDto;
import com.wordnote.member.dto.request.MemberPatchDto;
import com.wordnote.member.dto.response.MemberResponseDto;
import com.wordnote.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MemberMapper {
    //members -> dtos
    public List<MemberResponseDto> toResponseDto(List<Member> memberList) {

        if (memberList == null) return List.of();

        return memberList.stream()
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
    public Member CreateToMember(MemberCreateDto memberCreateDto) {
        return Member.builder()
                .name(memberCreateDto.getName())
                .nickname(memberCreateDto.getNickname())
                .email(memberCreateDto.getEmail())
                .password(memberCreateDto.getPassword())
                .build();
    }

    //patchDto -> member
    public Member PatchToMember(MemberPatchDto memberPatchDto) {
        return Member.builder()
                .nickname(memberPatchDto.getNickname())
                .email(memberPatchDto.getEmail())
                .password(memberPatchDto.getPassword())
                .build();
    }
}
