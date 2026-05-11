import React, { useState, useRef } from "react";
import { BoardType, BoxState, TabType } from "@/types";
import { useApp } from "@/contexts/AppContext";
import BoxCard from "./BoxCard";
import { Button } from "@/components/ui/button";
import { Save, Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BoardViewProps {
  boardType: "ROUTINE" | "EVENT";
}

export default function BoardView({ boardType }: BoardViewProps) {
  const {
    state,
    switchTab,
    saveBoard,
    moveBox,
    deleteBox,
    completeDay,
  } = useApp();

  const [draggedBoxId, setDraggedBoxId] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const dragOverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!state.boardPair) {
    return <div className="p-4">보드 로드 중...</div>;
  }

  const type = boardType === "ROUTINE" ? BoardType.ROUTINE : BoardType.EVENT;
  const currentBoard = type === BoardType.ROUTINE ? state.boardPair.routine : state.boardPair.event;

  // 현재 탭에 맞는 박스 필터링
  const filteredBoxes = currentBoard.boxes.filter((box) => {
    if (state.currentTab === TabType.TODO) {
      return box.state === BoxState.READY || box.state === BoxState.PROGRESS;
    } else {
      return box.state === BoxState.DONE;
    }
  });

  const handleDragStart = (boxId: string) => {
    setDraggedBoxId(boxId);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    // 타이머를 통해 상태 업데이트 빈도 제한
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
    }
    
    dragOverTimeoutRef.current = setTimeout(() => {
      setDropTargetIndex(index);
    }, 10);
  };

  const handleDrop = (targetIndex: number) => {
    if (!draggedBoxId) return;

    const sourceIndex = currentBoard.boxes.findIndex((b) => b.id === draggedBoxId);
    if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
      moveBox(draggedBoxId, sourceIndex, targetIndex);
    }
    setDraggedBoxId(null);
    setDropTargetIndex(null);
    
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
    }
  };

  const handleDragEnd = () => {
    setDraggedBoxId(null);
    setDropTargetIndex(null);
    
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
    }
  };

  const handleDragLeave = () => {
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
    }
    setDropTargetIndex(null);
  };

  const handleSave = () => {
    saveBoard();
    setShowSaveDialog(false);
  };

  const handleLoad = () => {
    if (currentBoard.boxes.length > 0) {
      setShowLoadDialog(true);
    } else {
      setShowLoadDialog(false);
    }
  };

  const handleCompleteDay = () => {
    completeDay();
    setShowCompleteDialog(false);
  };

  return (
    <div className="flex flex-col h-full gap-3 p-3 bg-white overflow-hidden">
      {/* 상단: 보드 제목 및 저장/로드 */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
        <h2 className="text-base font-bold text-gray-800">
          {type === BoardType.ROUTINE ? "루틴 보드" : "이벤트 보드"}
        </h2>

        {type === BoardType.ROUTINE && (
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)} className="text-xs h-8">
              <Save size={14} className="mr-1" />
              저장
            </Button>
            <Button variant="outline" size="sm" onClick={handleLoad} className="text-xs h-8">
              <Download size={14} className="mr-1" />
              로드
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowCompleteDialog(true)}
              className="text-xs h-8"
            >
              전체 완료
            </Button>
          </div>
        )}
      </div>

      {/* 탭: TODO / DONE */}
      <Tabs value={state.currentTab} onValueChange={(value) => switchTab(value as TabType)} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-auto grid-cols-2 h-8">
          <TabsTrigger value={TabType.TODO} className="text-xs">TODO</TabsTrigger>
          <TabsTrigger value={TabType.DONE} className="text-xs">DONE</TabsTrigger>
        </TabsList>

        <TabsContent value={TabType.TODO} className="flex-1 overflow-auto mt-2">
          <div className="space-y-0 pr-2">
            {filteredBoxes.length === 0 ? (
              <div className="text-center text-gray-500 py-6 border-2 border-dashed border-gray-300 rounded-sm text-xs">
                <p>진행 중인 작업이 없습니다.</p>
              </div>
            ) : (
              filteredBoxes.map((box, index) => (
                <div
                  key={box.id}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragLeave={handleDragLeave}
                  className="relative"
                >
                  {/* 삽입 위치 표시 */}
                  {dropTargetIndex === index && draggedBoxId !== box.id && (
                    <div className="h-12 bg-gradient-to-b from-blue-400 to-blue-300 rounded-lg my-2 shadow-lg animate-pulse" />
                  )}

                  <BoxCard
                    box={box}
                    isDragging={draggedBoxId === box.id}
                    isDropTarget={dropTargetIndex === index}
                    onDragStart={() => handleDragStart(box.id)}
                    onDragEnd={handleDragEnd}
                  />
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value={TabType.DONE} className="flex-1 overflow-auto mt-2">
          <div className="space-y-0 pr-2">
            {filteredBoxes.length === 0 ? (
              <div className="text-center text-gray-500 py-6 border-2 border-dashed border-gray-300 rounded-sm text-xs">
                <p>완료된 작업이 없습니다.</p>
              </div>
            ) : (
              filteredBoxes.map((box) => (
                <BoxCard key={box.id} box={box} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* 저장 확인 다이얼로그 */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>보드 저장</AlertDialogTitle>
            <AlertDialogDescription>
              현재 보드 상태를 저장하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>저장</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* 로드 확인 다이얼로그 */}
      <AlertDialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>진행 중인 보드 저장</AlertDialogTitle>
            <AlertDialogDescription>
              진행 중인 보드를 저장할까요? 저장하지 않으면 현재 상태가 손실됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>저장 안 함</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>저장 후 로드</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* 전체 완료 확인 다이얼로그 */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>하루 완료 처리</AlertDialogTitle>
            <AlertDialogDescription>
              루틴 보드는 초기화되고, 이벤트 보드는 삭제됩니다. 계속하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteDay}>완료</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
