package com.wordnote.domain.member.service;

import com.wordnote.domain.member.dto.request.MemberCreateDto;
import com.wordnote.domain.member.dto.request.MemberUpdateDto;
import com.wordnote.domain.member.dto.request.PasswordRequest;
import com.wordnote.domain.member.dto.response.MemberResponseDto;
import com.wordnote.domain.member.entity.Member;
import com.wordnote.domain.member.entity.Role;
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
import java.util.UUID;

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
        member.setPassword(encryptedPassword);// 암호화된 비번으로 교체

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

        member.update(dto.getNickname(), dto.getEmail());

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
        if (dto.getEmail().equals("dioneo54@gmail.com")) {
            member.setRole(Role.ADMIN);
        } else {
            member.setRole(Role.BASIC);
        }
    }

    //구글 회원가입
    public Member processOAuth2User(String email, String name, String profile) {
        String tempPassword = UUID.randomUUID().toString();
        Member member = memberRepository.findByEmail(email)
                .orElse(new Member(email, name, tempPassword, profile)); //name = nickname

        return memberRepository.save(member);
    }

    @Transactional
    public void updateRefreshToken(String email, String refreshToken) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new LogicException(ExceptionCode.MEMBER_NOT_FOUND));

        member.setRefreshToken(refreshToken);
    }

    @Transactional
    public void updatePassword(PasswordRequest dto, long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new LogicException(ExceptionCode.MEMBER_NOT_FOUND));

        String encryptedPassword = passwordEncoder.encode(dto.getPassword());
        member.setPassword(encryptedPassword); // 암호화
    }

    public Member findByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new LogicException(ExceptionCode.MEMBER_NOT_FOUND));
    }
}
