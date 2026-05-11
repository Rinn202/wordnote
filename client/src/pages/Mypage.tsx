import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";

export default function MyPage() {
  const { state, setUser } = useApp();
  const [, setLocation] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [nickname, setNickname] = useState(state.user?.nickname || "");
  const [email, setEmail] = useState(state.user?.email || "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  if (!state.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
          <Button onClick={() => setLocation("/")}>홈으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = () => {
    // 프로필 업데이트 로직
    if (state.user) {
      setUser({
        ...state.user,
        nickname,
        email,
      });
      alert("프로필이 업데이트되었습니다.");
    }
  };

  const handleChangePassword = () => {
    if (!password || !newPassword) {
      alert("현재 비밀번호와 새 비밀번호를 입력해주세요.");
      return;
    }
    // 비밀번호 변경 로직
    alert("비밀번호가 변경되었습니다.");
    setPassword("");
    setNewPassword("");
  };

  const handleDeleteAccount = () => {
    if (state.user) {
      setUser(null);
      setLocation("/");
      alert("계정이 삭제되었습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

        {/* 프로필 섹션 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">기본 정보</h2>

          {state.user.profileImage && (
            <div className="mb-4">
              <img
                src={state.user.profileImage}
                alt="프로필"
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
              />
            </div>

            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
              />
            </div>

            <Button onClick={handleUpdateProfile} className="w-full">
              프로필 업데이트
            </Button>
          </div>
        </div>

        {/* 비밀번호 변경 섹션 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">비밀번호 변경</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">현재 비밀번호</Label>
              <Input
                id="current-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
              />
            </div>

            <div>
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요"
              />
            </div>

            <Button onClick={handleChangePassword} className="w-full">
              비밀번호 변경
            </Button>
          </div>
        </div>

        {/* 계정 삭제 섹션 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">계정 관리</h2>

          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="w-full"
          >
            계정 삭제
          </Button>
        </div>

        {/* 계정 삭제 확인 다이얼로그 */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>계정 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                이 작업은 되돌릴 수 없습니다. 계정을 정말 삭제하시겠습니까?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600">
                삭제
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
