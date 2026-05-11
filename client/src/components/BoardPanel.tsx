/**
 * BoardPanel - 보드 패널 컴포넌트 (루틴 or 이벤트)
 * - 상단 TODO(READY+IN_PROGRESS) / DONE 탭
 * - 박스 목록 (드래그앤드롭)
 * - 루틴 보드: 저장/로드 아이콘
 * - 이벤트 보드: 저장 불가 (임시)
 * - 휴지통 드롭 영역
 */
import { useState, useCallback } from 'react';
import { Save, Upload, Trash2 } from 'lucide-react';
import { Board, Box, BoardType, boxApi, boardApi } from '@/lib/api';
import BoxItem from './BoxItem';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type TabType = 'todo' | 'done';

interface BoardPanelProps {
  board: Board;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (board: Board) => void;
  onSave?: () => void;
  onLoad?: () => void;
  isRoutine: boolean;
}

export default function BoardPanel({
  board, isSelected, onSelect, onUpdate, onSave, onLoad, isRoutine,
}: BoardPanelProps) {
  const [tab, setTab] = useState<TabType>('todo');
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragTarget, setDragTarget] = useState<{ id: number; pos: 'above' | 'below' } | null>(null);
  const [trashOver, setTrashOver] = useState(false);

  const todoBoxes = board.boxes
    .filter(b => b.state === 'READY' || b.state === 'IN_PROGRESS')
    .sort((a, b) => a.sortIndex - b.sortIndex);

  const doneBoxes = board.boxes
    .filter(b => b.state === 'DONE')
    .sort((a, b) => a.sortIndex - b.sortIndex);

  const visibleBoxes = tab === 'todo' ? todoBoxes : doneBoxes;

  const isExpired = (box: Box) => {
    if (!box.expireTime) return false;
    const now = new Date();
    const [h, m] = box.expireTime.split(':').map(Number);
    const expire = new Date();
    expire.setHours(h, m, 0, 0);
    return now > expire;
  };

  const handleBoxUpdate = (updated: Box) => {
    onUpdate({
      ...board,
      boxes: board.boxes.map(b => b.boxId === updated.boxId ? updated : b),
    });
  };

  const handleBoxDelete = async (boxId: number) => {
    try {
      await boxApi.delete(boxId);
      onUpdate({ ...board, boxes: board.boxes.filter(b => b.boxId !== boxId) });
      toast.success('박스가 삭제되었습니다.');
    } catch (err: any) {
      toast.error(err.message || '삭제 실패');
    }
  };

  // Drag & Drop
  const handleDragStart = useCallback((boxId: number) => setDraggingId(boxId), []);
  const handleDragEnd = useCallback(() => { setDraggingId(null); setDragTarget(null); }, []);

  const handleDragOver = useCallback((boxId: number, pos: 'above' | 'below') => {
    setDragTarget({ id: boxId, pos });
  }, []);

  const handleDrop = useCallback(async (targetBoxId: number, position: 'above' | 'below') => {
    if (!draggingId || draggingId === targetBoxId) { setDragTarget(null); return; }

    const sorted = [...visibleBoxes];
    const fromIdx = sorted.findIndex(b => b.boxId === draggingId);
    const toIdx = sorted.findIndex(b => b.boxId === targetBoxId);
    if (fromIdx === -1 || toIdx === -1) { setDragTarget(null); return; }

    const insertIdx = position === 'above' ? toIdx : toIdx + 1;
    const newIndex = position === 'above' ? toIdx + 1 : toIdx + 2;

    try {
      // boxTask move API: 첫 번째 task의 boxTaskId 사용
      const draggingBox = sorted[fromIdx];
      if (draggingBox.tasks.length > 0) {
        await boxApi.changeOption(draggingId, { sortIndex: newIndex });
      }
      // Optimistic update
      const reordered = [...sorted];
      const [moved] = reordered.splice(fromIdx, 1);
      const adjustedInsert = fromIdx < insertIdx ? insertIdx - 1 : insertIdx;
      reordered.splice(adjustedInsert, 0, moved);
      const updatedBoxes = reordered.map((b, i) => ({ ...b, sortIndex: i + 1 }));
      const otherBoxes = board.boxes.filter(b => !updatedBoxes.find(u => u.boxId === b.boxId));
      onUpdate({ ...board, boxes: [...otherBoxes, ...updatedBoxes] });
    } catch (err: any) {
      toast.error('순서 변경 실패');
    }
    setDragTarget(null);
    setDraggingId(null);
  }, [draggingId, visibleBoxes, board, onUpdate]);

  // Trash drop
  const handleTrashDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setTrashOver(false);
    if (!draggingId) return;
    if (confirm('박스를 삭제할까요?')) {
      await handleBoxDelete(draggingId);
    }
    setDraggingId(null);
  };

  const borderColor = isSelected
    ? isRoutine ? 'border-gray-700' : 'border-orange-400'
    : 'border-gray-200';

  return (
    <div
      className={cn('flex flex-col border-2 rounded-sm bg-white transition-all', borderColor)}
      onClick={onSelect}
      style={{ minHeight: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
        <span className="text-xs font-semibold mono text-gray-500 uppercase tracking-wider">
          {isRoutine ? 'routine box' : 'event box'}
        </span>
        {isRoutine && (
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <button
              onClick={onSave}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-500 hover:text-gray-700"
              title="보드 저장"
            >
              <Save size={14} />
            </button>
            <button
              onClick={onLoad}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-500 hover:text-gray-700"
              title="보드 불러오기"
            >
              <Upload size={14} />
            </button>
          </div>
        )}
        {!isRoutine && (
          <span className="text-xs text-orange-400 mono">event</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={e => { e.stopPropagation(); setTab('todo'); }}
          className={cn('flex-1 py-1.5 text-xs font-medium transition-colors',
            tab === 'todo' ? 'border-b-2 border-gray-700 text-gray-800' : 'text-gray-400 hover:text-gray-600')}
        >
          TODO
          {todoBoxes.length > 0 && (
            <span className="ml-1 bg-gray-200 text-gray-600 text-xs px-1 rounded-sm">{todoBoxes.length}</span>
          )}
        </button>
        <button
          onClick={e => { e.stopPropagation(); setTab('done'); }}
          className={cn('flex-1 py-1.5 text-xs font-medium transition-colors',
            tab === 'done' ? 'border-b-2 border-[#10B981] text-[#10B981]' : 'text-gray-400 hover:text-gray-600')}
        >
          DONE
          {doneBoxes.length > 0 && (
            <span className="ml-1 bg-green-100 text-green-600 text-xs px-1 rounded-sm">{doneBoxes.length}</span>
          )}
        </button>
      </div>

      {/* Box list */}
      <div
        className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5"
        onDragOver={e => e.preventDefault()}
        style={{ minHeight: '120px', maxHeight: '420px' }}
      >
        {visibleBoxes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-gray-300 mono py-8">
            {tab === 'todo' ? '할 일이 없습니다' : '완료된 항목이 없습니다'}
          </div>
        ) : (
          visibleBoxes.map(box => (
            <BoxItem
              key={box.boxId}
              box={box}
              onUpdate={handleBoxUpdate}
              onDelete={handleBoxDelete}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragTarget={dragTarget?.id === box.boxId}
              dragPosition={dragTarget?.id === box.boxId ? dragTarget.pos : null}
              isExpired={isExpired(box)}
            />
          ))
        )}
      </div>

      {/* Trash zone */}
      <div
        onDragOver={e => { e.preventDefault(); setTrashOver(true); }}
        onDragLeave={() => setTrashOver(false)}
        onDrop={handleTrashDrop}
        className={cn(
          'flex items-center justify-center gap-1.5 py-2 border-t border-dashed transition-all text-xs',
          trashOver
            ? 'border-red-400 bg-red-50 text-red-500'
            : 'border-gray-200 text-gray-300'
        )}
      >
        <Trash2 size={13} />
        <span className="mono">휴지통으로 드래그하여 삭제</span>
      </div>
    </div>
  );
}
