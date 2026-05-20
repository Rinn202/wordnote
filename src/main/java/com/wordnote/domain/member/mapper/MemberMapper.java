package com.wordnote.domain.member.mapper;

import com.wordnote.domain.board.entity.Board;
import com.wordnote.domain.member.dto.request.MemberCreateDto;
import com.wordnote.domain.member.dto.request.MemberUpdateDto;
import com.wordnote.domain.member.dto.response.MemberResponseDto;
import com.wordnote.domain.member.entity.Member;
import com.wordnote.domain.member.entity.Role;
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

    //member -> response
    public MemberResponseDto toResponseDto(Member member) {

        return MemberResponseDto.builder()
                .role(member.getRole())
                .nickname(member.getNickname())
                .email(member.getEmail())
                .createdAt(member.getCreatedAt())
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
                .password(dto.getPassword()) //생성시에만
                .role(Role.BASIC)
                .build();
    }

    //patchDto -> member 필요없어서 사용안하는중
    public Member updateToMember(MemberUpdateDto dto) {
        return Member.builder()
                .nickname(dto.getNickname())
                .email(dto.getEmail())
                .profileImageUrl(dto.getProfileUri())
                .build();
    }
}
