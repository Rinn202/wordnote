package com.wordnote.domain.member.mapper;

import com.wordnote.domain.board.entity.Board;
import com.wordnote.domain.member.dto.request.MemberCreateDto;
import com.wordnote.domain.member.dto.request.MemberUpdateDto;
import com.wordnote.domain.member.dto.response.MemberResponseDto;
import com.wordnote.domain.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MemberMapper {
    //members -> dtos
    public List<MemberResponseDto> toResponseDtos(List<Member> members) {

        if (members == null) return List.of();

        return members.stream()
                .map(this::toResponseDto)
                .toList();
    }

    //member -> dto
    public MemberResponseDto toResponseDto(Member member) {

        return MemberResponseDto.builder()
                .role(member.getRole())
                .nickname(member.getNickname())
                .email(member.getEmail())
                .password(member.getPassword())
                .profileUri(member.getProfileImageUrl())
                .boardIds(member.getBoards().stream().map(Board::getBoardId).toList())
                .build();
    }

    //createDto -> member
    public Member createToMember(MemberCreateDto dto) {
        return Member.builder()
                .name(dto.getName())
                .nickname(dto.getNickname())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .build();
    }

    //patchDto -> member
    public Member updateToMember(MemberUpdateDto dto) {
        return Member.builder()
                .nickname(dto.getNickname())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .build();
    }
}
