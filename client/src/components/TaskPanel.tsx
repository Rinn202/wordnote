import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { BoardType } from "@/types";

export default function TaskPanel() {
  const { state, addBox } = useApp();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [customBoxName, setCustomBoxName] = useState("");
  const [targetBoard, setTargetBoard] = useState<BoardType>(BoardType.EVENT);

  // 카테고리별로 태스크 그룹화 (간단한 방식)
  const tasksByCategory: Record<string, any[]> = {};
  state.tasks.forEach((task) => {
    if (!tasksByCategory[task.category]) {
      tasksByCategory[task.category] = [];
    }
    tasksByCategory[task.category].push(task);
  });

  const categories = Object.keys(tasksByCategory);

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleAddBox = () => {
    if (selectedTasks.length === 0) return;

    const selectedTaskObjects = state.tasks
      .filter((t) => selectedTasks.includes(t.id))
      .map((t) => ({
        ...t,
        isDone: false,
      }));

    addBox(selectedTaskObjects, customBoxName || undefined, targetBoard);

    setSelectedTasks([]);
    setCustomBoxName("");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="p-2 border-b border-gray-300 bg-gray-50">
        <h3 className="font-semibold text-sm text-gray-800">태스크 목록</h3>
      </div>

      {/* 보드 선택 */}
      <div className="p-2 border-b border-gray-200 bg-white">
        <div className="flex gap-2">
          <Button
            variant={targetBoard === BoardType.ROUTINE ? "default" : "outline"}
            size="sm"
            onClick={() => setTargetBoard(BoardType.ROUTINE)}
            className="flex-1 text-xs h-8"
          >
            루틴
          </Button>
          <Button
            variant={targetBoard === BoardType.EVENT ? "default" : "outline"}
            size="sm"
            onClick={() => setTargetBoard(BoardType.EVENT)}
            className="flex-1 text-xs h-8"
          >
            이벤트
          </Button>
        </div>
      </div>

      {/* 카테고리별 태스크 탭 */}
      <div className="flex-1 overflow-auto p-2">
        {categories.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">
            등록된 태스크가 없습니다.
          </div>
        ) : (
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 3)}, 1fr)` }}>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs py-1">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="space-y-1 mt-2">
                {tasksByCategory[category].map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleTaskToggle(task.id)}
                    className={`w-full text-left p-2 rounded border text-sm transition-colors flex items-center gap-2 ${
                      selectedTasks.includes(task.id)
                        ? "bg-blue-100 border-blue-300"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      readOnly
                      className="w-4 h-4 flex-shrink-0"
                    />
                    <span className="flex-1 truncate text-gray-700 font-medium pl-1">
                      {task.name}
                    </span>
                  </button>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* 박스 생성 섹션 */}
      <div className="p-2 border-t border-gray-300 bg-gray-50 space-y-2">
        {selectedTasks.length > 0 && (
          <>
            <Input
              placeholder="박스 이름 (선택)"
              value={customBoxName}
              onChange={(e) => setCustomBoxName(e.target.value)}
              className="text-sm h-9"
            />
            <Button
              onClick={handleAddBox}
              className="w-full h-9 text-sm"
              size="sm"
            >
              <Plus size={16} className="mr-1" />
              박스 생성 ({selectedTasks.length})
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
