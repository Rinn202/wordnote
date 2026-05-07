package com.wordnote.domain.member.service;

import com.wordnote.domain.member.dto.request.MemberCreateDto;
import com.wordnote.domain.member.dto.request.MemberUpdateDto;
import com.wordnote.domain.member.dto.response.MemberResponseDto;
import com.wordnote.domain.member.entity.Member;
import com.wordnote.domain.member.entity.MemberRole;
import com.wordnote.domain.member.mapper.MemberMapper;
import com.wordnote.domain.member.repository.MemberRepository;
import com.wordnote.exception.ExceptionCode;
import com.wordnote.exception.LogicException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class MemberService {
    private final MemberRepository memberRepository;
    private final MemberMapper memberMapper;
    private final PasswordEncoder passwordEncoder;

    //mypage
    public MemberResponseDto findMember(long memberId) {
        return memberMapper.toResponseDto(findById(memberId));
    }

    //전체 회원목록
    public List<MemberResponseDto> findAll() {
        List<Member> members = memberRepository.findAll();

        if (members.isEmpty()) {
            throw new LogicException(ExceptionCode.MEMBER_NOT_FOUND);
        }
        return memberMapper.toResponseDtos(members);
    }

    //회원가입
    @Transactional
    public MemberResponseDto createMember(MemberCreateDto dto) {
        Member member = memberMapper.createToMember(dto);
        verifyExistsEmail(member.getEmail());

        String encryptedPassword = passwordEncoder.encode(member.getPassword());
        member.encryptPassword(encryptedPassword);// 암호화된 비번으로 교체

        adminMaker(dto, member);
        memberRepository.save(member);

        return memberMapper.toResponseDto(member);
    }

    //이메일 중복검사
    private void verifyExistsEmail(String email) {
        Optional<Member> member = memberRepository.findByEmail(email);
        if (member.isPresent()) {
            throw new LogicException(ExceptionCode.DUPLICATE_EMAIL);
        }
    }

    //회원정보수정
    @Transactional
    public MemberResponseDto updateMember(MemberUpdateDto dto, long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.MEMBER_NOT_FOUND));

        member.update(dto.getNickname(), dto.getPassword(), dto.getEmail());

        return memberMapper.toResponseDto(member);
    }

    //회원탈퇴
    @Transactional
    public void deleteMember(long memberId) {

        Member foundMember = memberRepository.findById(memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.MEMBER_NOT_FOUND));
        memberRepository.delete(foundMember);
    }

    public Member findById(long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.MEMBER_NOT_FOUND));
    }

    private static void adminMaker(MemberCreateDto dto, Member member) {
        if (dto.getEmail().equals("admin@gmail.com")) {
            member.setRole(MemberRole.ADMIN);
        } else {
            member.setRole(MemberRole.BASIC);
        }
    }
}
