import React, { useState } from "react";
import { Box, BoxState, AlarmType, BoxTask } from "@/types";
import { useApp } from "@/contexts/AppContext";
import { Bell, Trash2, Bookmark, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface BoxCardProps {
  box: Box;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const getStateColor = (state: BoxState): string => {
  switch (state) {
    case BoxState.READY:
      return "bg-white";
    case BoxState.PROGRESS:
      return "bg-blue-50";
    case BoxState.DONE:
      return "bg-green-50";
    default:
      return "bg-white";
  }
};

const getStateButtonColor = (state: BoxState): string => {
  switch (state) {
    case BoxState.READY:
      return "bg-gray-400 hover:bg-gray-500 text-white";
    case BoxState.PROGRESS:
      return "bg-blue-500 hover:bg-blue-600 text-white";
    case BoxState.DONE:
      return "bg-green-500 hover:bg-green-600 text-white";
    default:
      return "bg-gray-400";
  }
};

const getStateLabel = (state: BoxState): string => {
  switch (state) {
    case BoxState.READY:
      return "준비";
    case BoxState.PROGRESS:
      return "진행중";
    case BoxState.DONE:
      return "완료";
    default:
      return "";
  }
};

const isExpired = (expireTime?: number): boolean => {
  if (!expireTime) return false;
  return Date.now() > expireTime;
};

export default function BoxCard({
  box,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: BoxCardProps) {
  const { updateBoxState, deleteBox, updateBoxAlarm, updateBoxExpireTime, updateBoxBookmark } =
    useApp();
  const [showOptions, setShowOptions] = useState(false);
  const [customExpireTime, setCustomExpireTime] = useState("");
  const [taskStates, setTaskStates] = useState<Record<string, boolean>>(
    box.tasks.reduce((acc, task) => ({ ...acc, [task.id]: task.isDone || false }), {})
  );
  const [isRemoving, setIsRemoving] = useState(false);

  const handleStateChange = () => {
    const nextState =
      box.state === BoxState.READY
        ? BoxState.PROGRESS
        : box.state === BoxState.PROGRESS
          ? BoxState.DONE
          : BoxState.READY;
    updateBoxState(box.id, nextState);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(true);
    setTimeout(() => {
      deleteBox(box.id);
    }, 300);
  };

  const handleAlarmChange = (alarmType: AlarmType) => {
    updateBoxAlarm(box.id, alarmType);
  };

  const handleExpireTimeChange = (hours: number) => {
    const expireTime = Date.now() + hours * 60 * 60 * 1000;
    updateBoxExpireTime(box.id, expireTime);
  };

  const handleCustomExpireTime = () => {
    if (!customExpireTime) return;
    const expireTime = new Date(customExpireTime).getTime();
    if (!isNaN(expireTime)) {
      updateBoxExpireTime(box.id, expireTime);
      setCustomExpireTime("");
    }
  };

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateBoxBookmark(box.id, !box.isBookmarked);
  };

  const handleTaskDoneToggle = (taskId: string) => {
    // 태스크 완료 시 즉시 상태 변경 (애니메이션 없음)
    setTaskStates((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const expired = isExpired(box.expireTime);
  const mainTaskName = box.tasks[0]?.name || "작업";
  const completedCount = Object.values(taskStates).filter(Boolean).length;

  return (
    <>
      {/* 삽입 위치 애니메이션 - 위 (크게 갈라짐) */}
      {isDropTarget && (
        <div className="h-3 bg-gradient-to-b from-blue-400 to-blue-200 rounded-full my-2 animate-pulse shadow-md" />
      )}

      <div
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        className={`
          relative p-3 rounded-sm transition-all cursor-move shadow-sm my-2
          ${getStateColor(box.state)}
          ${isDragging ? "opacity-50 scale-95" : "opacity-100"}
          ${expired ? "opacity-60 grayscale" : ""}
          ${isRemoving ? "opacity-0 scale-x-0 max-h-0 origin-left" : "opacity-100 scale-x-100 max-h-96 origin-left"}
          hover:shadow-md duration-500 border-l-4 border-gray-300
        `}
      >
        {/* 박스 헤더 */}
        <div className="flex items-center justify-between gap-2">
          {/* 박스 이름 또는 태스크 목록 */}
          <div className="flex-1 min-w-0">
            {box.tasks.length > 1 ? (
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {box.name}
              </div>
            ) : (
              <div className="text-sm text-gray-700 font-medium truncate">{mainTaskName}</div>
            )}
          </div>

          {/* 상태 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStateChange();
            }}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors flex-shrink-0 ${getStateButtonColor(box.state)}`}
          >
            {getStateLabel(box.state)}
          </button>

          {/* 북마크 아이콘 */}
          <button
            onClick={handleBookmarkToggle}
            className={`p-1 hover:bg-yellow-100 rounded transition-colors flex-shrink-0 ${
              box.isBookmarked ? "text-yellow-500" : "text-gray-400"
            }`}
          >
            <Bookmark size={16} fill={box.isBookmarked ? "currentColor" : "none"} />
          </button>

          {/* 삭제 버튼 */}
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 rounded transition-colors text-gray-500 hover:text-red-600 flex-shrink-0"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* 태스크 목록 (항상 펼쳐짐) */}
        {box.tasks.length > 1 && (
          <div className="mt-2 pt-2 border-t border-gray-300 space-y-1">
            {box.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 pl-2"
              >
                <button
                  onClick={() => handleTaskDoneToggle(task.id)}
                  className={`p-0.5 rounded transition-colors flex-shrink-0 ${
                    taskStates[task.id]
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Check size={12} />
                </button>
                <span className={`text-xs truncate ${taskStates[task.id] ? "line-through text-gray-400" : "text-gray-700"}`}>
                  {task.name}
                </span>
              </div>
            ))}
            {completedCount > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {completedCount}/{box.tasks.length} 완료
              </div>
            )}
          </div>
        )}
      </div>

      {/* 옵션 다이얼로그 */}
      <Dialog open={showOptions} onOpenChange={setShowOptions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>박스 옵션</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 알람 설정 */}
            <div className="space-y-2">
              <Label>알람 설정</Label>
              <Select value={box.alarmType} onValueChange={(value) => handleAlarmChange(value as AlarmType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AlarmType.NONE}>알람 없음</SelectItem>
                  <SelectItem value={AlarmType.TEN_MINUTES_BEFORE}>10분 전</SelectItem>
                  <SelectItem value={AlarmType.THIRTY_MINUTES_BEFORE}>30분 전</SelectItem>
                  <SelectItem value={AlarmType.ONE_HOUR_BEFORE}>1시간 전</SelectItem>
                  <SelectItem value={AlarmType.AT_TIME}>정시</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 만료 시간 설정 */}
            <div className="space-y-2">
              <Label>만료 시간</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExpireTimeChange(1)}
                  className="flex-1"
                >
                  1시간
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExpireTimeChange(3)}
                  className="flex-1"
                >
                  3시간
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExpireTimeChange(24)}
                  className="flex-1"
                >
                  1일
                </Button>
              </div>

              {/* 직접 시간 지정 */}
              <div className="space-y-1">
                <Label className="text-xs">직접 지정</Label>
                <div className="flex gap-2">
                  <Input
                    type="datetime-local"
                    value={customExpireTime}
                    onChange={(e) => setCustomExpireTime(e.target.value)}
                    className="text-xs h-8"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCustomExpireTime}
                    className="text-xs"
                  >
                    설정
                  </Button>
                </div>
              </div>

              {box.expireTime && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  만료: {new Date(box.expireTime).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
