package com.wordnote.member.service;

import com.wordnote.member.entity.Member;
import com.wordnote.member.repository.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class MemberService {
    private final MemberRepository memberRepository;

    public Member findById(long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found: " + memberId));
    }

    public List<Member> findAll() { //master 권한 인수추가하기
        return memberRepository.findAll();
    }

    @Transactional
    public Member createMember(Member member) {
        return memberRepository.save(member);
    }

    @Transactional
    public Member updateMember(long memberId, Member updateRequest) {
        Member foundMember = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        foundMember.update(
                updateRequest.getNickname(), updateRequest.getPassword(),
                updateRequest.getEmail(), updateRequest.getBoards()
        );
        return memberRepository.save(foundMember);
    }

    @Transactional
    public void deleteMember(long memberId) {
        Member foundMember = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));
        memberRepository.delete(foundMember);
    }
}
