import React from "react";
import { Link, useLocation } from "wouter";
import { Home, User, Settings } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="w-auto bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-start py-6 px-4 gap-4 border-r border-slate-700">
      {/* 캐릭터 플레이스홀더 */}
      <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-white text-2xl">
        🦉
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-col gap-3 w-full">
        <Link href="/">
          <button
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
              isActive("/")
                ? "bg-blue-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-slate-700"
            }`}
            title="홈"
          >
            <Home size={20} />
            <span>홈</span>
          </button>
        </Link>

        <Link href="/mypage">
          <button
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
              isActive("/mypage")
                ? "bg-blue-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-slate-700"
            }`}
            title="마이페이지"
          >
            <User size={20} />
            <span>마이페이지</span>
          </button>
        </Link>

        <Link href="/settings">
          <button
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
              isActive("/settings")
                ? "bg-blue-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-slate-700"
            }`}
            title="설정"
          >
            <Settings size={20} />
            <span>설정</span>
          </button>
        </Link>
      </nav>

      {/* 하단 여백 */}
      <div className="flex-1" />
    </div>
  );
}
