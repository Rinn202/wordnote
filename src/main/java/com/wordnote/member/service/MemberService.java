package com.wordnote.member.service;

import com.wordnote.member.entity.Member;
import com.wordnote.member.repository.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MemberService {
    MemberRepository memberRepository;

    public Member findById(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found: " + memberId));
    }

    public List<Member> findAll() { //master 권한 인수추가하기
        return memberRepository.findAll();
    }

    public Member createMember(Member member) {
        return memberRepository.save(member);
    }

    public Member patchMember(long memberId, Member updateRequest) {
        Member foundMember = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        foundMember.update(
                updateRequest.getNickname(), updateRequest.getPassword(),
                updateRequest.getEmail(), updateRequest.getBoards()
        );
        return foundMember;
    }

    public void deleteMember(long memberId) {
        memberRepository.deleteById(memberId);
    }
}
