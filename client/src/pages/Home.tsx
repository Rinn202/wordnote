import React from "react";
import Sidebar from "@/components/Sidebar";
import BoardView from "@/components/BoardView";
import TaskPanel from "@/components/TaskPanel";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="flex h-screen bg-white">
      {/* 좌측 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {/* 보드 영역 */}
        <div className="flex-1 flex overflow-hidden gap-4 p-4 bg-gray-50">
          {/* 좌측: 루틴 보드 (600px 고정) */}
          <div className="w-[600px] bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <BoardView boardType="ROUTINE" />
          </div>

          {/* 중앙-우측: 이벤트 보드 (600px 고정) + 태스크 목록 */}
          <div className="flex gap-4 flex-1 min-w-0">
            {/* 이벤트 보드 */}
            <div className="w-[600px] bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <BoardView boardType="EVENT" />
            </div>

            {/* 우측: 태스크 목록 */}
            <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 min-w-0">
              <TaskPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
