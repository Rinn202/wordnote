/**
 * BoxItem - 박스 컴포넌트
 * - 가로 긴 바 형태, 좌측 상태 컬러 스트라이프
 * - 우측: 상태 버튼(노랑), 알람 아이콘(주황)
 * - 클릭 시 옵션 패널 열림 (알람설정, 만료시간, 북마크)
 * - 드래그앤드롭 지원
 * - 만료시간 지난 박스 회색 처리
 */
import { useState, useRef } from 'react';
import { Bell, Bookmark, Clock, Trash2, ChevronRight } from 'lucide-react';
import { Box, BoxState, AlarmType, boxApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BoxItemProps {
  box: Box;
  onUpdate: (updated: Box) => void;
  onDelete: (boxId: number) => void;
  onDragStart: (boxId: number) => void;
  onDragEnd: () => void;
  onDragOver: (boxId: number, position: 'above' | 'below') => void;
  onDrop: (targetBoxId: number, position: 'above' | 'below') => void;
  isDragTarget: boolean;
  dragPosition: 'above' | 'below' | null;
  isExpired: boolean;
}

const STATE_LABELS: Record<BoxState, string> = {
  READY: 'READY',
  IN_PROGRESS: 'IN_PROG',
  DONE: 'DONE',
};

const NEXT_STATE: Record<BoxState, BoxState> = {
  READY: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'READY',
};

const ALARM_LABELS: Record<AlarmType, string> = {
  NONE: '없음',
  AT_TIME: '정각',
  BEFORE_10: '10분 전',
  BEFORE_30: '30분 전',
};

export default function BoxItem({
  box, onUpdate, onDelete,
  onDragStart, onDragEnd, onDragOver, onDrop,
  isDragTarget, dragPosition, isExpired,
}: BoxItemProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expireInput, setExpireInput] = useState(box.expireTime?.slice(0, 5) || '');
  const dragRef = useRef<HTMLDivElement>(null);

  const isSingleTask = box.tasks.length === 1;
  const isMultiTask = box.tasks.length > 1;

  // 상태 변경
  const handleStateChange = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = NEXT_STATE[box.state];
    setLoading(true);
    try {
      const updated = await boxApi.changeState(box.boxId, next);
      onUpdate(updated);
    } catch (err: any) {
      toast.error(err.message || '상태 변경 실패');
    } finally {
      setLoading(false);
    }
  };

  // 옵션 저장
  const handleOptionSave = async (opts: {
    bookmark?: boolean; alarmType?: AlarmType; expireTime?: string;
  }) => {
    try {
      const updated = await boxApi.changeOption(box.boxId, opts);
      onUpdate(updated);
    } catch (err: any) {
      toast.error(err.message || '옵션 변경 실패');
    }
  };

  // 드래그 이벤트
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(box.boxId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = dragRef.current?.getBoundingClientRect();
    if (!rect) return;
    const midY = rect.top + rect.height / 2;
    onDragOver(box.boxId, e.clientY < midY ? 'above' : 'below');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = dragRef.current?.getBoundingClientRect();
    if (!rect) return;
    const midY = rect.top + rect.height / 2;
    onDrop(box.boxId, e.clientY < midY ? 'above' : 'below');
  };

  // 상태별 스타일
  const stateStyle = isExpired
    ? 'bg-gray-100 border-l-4 border-gray-300 opacity-50'
    : box.state === 'READY'
      ? 'bg-[#EBEBEB] border-l-4 border-[#AAAAAA]'
      : box.state === 'IN_PROGRESS'
        ? 'bg-[#FFFBEB] border-l-4 border-[#EAB308]'
        : 'bg-[#F0FDF4] border-l-4 border-[#10B981] opacity-80';

  const stateBtnStyle = box.state === 'DONE'
    ? 'bg-[#10B981] text-white'
    : 'bg-[#EAB308] text-white';

  return (
    <div className="relative">
      {/* Drag gap above */}
      {isDragTarget && dragPosition === 'above' && (
        <div className="h-10 bg-blue-100 border-2 border-dashed border-blue-300 rounded mx-1 mb-1 transition-all" />
      )}

      <div
        ref={dragRef}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => setShowOptions(s => !s)}
        className={cn(
          'group relative rounded-sm cursor-pointer transition-all duration-200 select-none',
          stateStyle,
          'hover:shadow-md'
        )}
      >
        {/* Main bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 min-h-[44px]">
          {/* Box name / task list */}
          <div className="flex-1 min-w-0">
            {isSingleTask ? (
              <span className="text-sm font-medium text-gray-800 truncate block">
                {box.tasks[0]?.taskName}
              </span>
            ) : (
              <>
                {isMultiTask && (
                  <span className="text-xs text-gray-500 font-medium block mb-1">{box.name}</span>
                )}
                <div className="flex flex-col gap-0.5">
                  {box.tasks.map(t => (
                    <span key={t.boxTaskId} className="text-xs text-gray-700 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                      {t.taskName}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
            {/* Alarm icon */}
            <button
              onClick={e => { e.stopPropagation(); handleOptionSave({ alarmType: box.alarmType === 'NONE' ? 'AT_TIME' : 'NONE' }); }}
              className={cn('p-1 rounded transition-colors', box.alarmType !== 'NONE' ? 'text-[#F97316]' : 'text-gray-300 hover:text-gray-400')}
              title="알람 설정"
            >
              <Bell size={14} />
            </button>

            {/* Bookmark */}
            <button
              onClick={e => { e.stopPropagation(); handleOptionSave({ bookmark: !box.bookmark }); }}
              className={cn('p-1 rounded transition-colors', box.bookmark ? 'text-blue-500' : 'text-gray-300 hover:text-gray-400')}
              title="북마크"
            >
              <Bookmark size={14} />
            </button>

            {/* State button */}
            <button
              onClick={handleStateChange}
              disabled={loading}
              className={cn('px-2 py-1 text-xs font-bold mono rounded-sm transition-all min-w-[60px]', stateBtnStyle)}
            >
              {loading ? '...' : STATE_LABELS[box.state]}
            </button>
          </div>
        </div>

        {/* Options panel */}
        {showOptions && (
          <div
            className="border-t border-gray-200 bg-white px-3 py-3 flex flex-col gap-2"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 flex-wrap">
              {/* Alarm type */}
              <div className="flex items-center gap-1.5">
                <Bell size={12} className="text-[#F97316]" />
                <select
                  value={box.alarmType}
                  onChange={e => handleOptionSave({ alarmType: e.target.value as AlarmType })}
                  className="text-xs border border-gray-200 px-1.5 py-1 bg-white focus:outline-none"
                >
                  {Object.entries(ALARM_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Expire time */}
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-gray-400" />
                <input
                  type="time"
                  value={expireInput}
                  onChange={e => setExpireInput(e.target.value)}
                  onBlur={() => handleOptionSave({ expireTime: expireInput ? `${expireInput}:00` : undefined })}
                  className="text-xs border border-gray-200 px-1.5 py-1 bg-white focus:outline-none"
                />
              </div>

              {/* Bookmark toggle */}
              <button
                onClick={() => handleOptionSave({ bookmark: !box.bookmark })}
                className={cn('flex items-center gap-1 text-xs px-2 py-1 border transition-colors',
                  box.bookmark ? 'border-blue-400 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-500')}
              >
                <Bookmark size={11} />
                {box.bookmark ? '북마크됨' : '북마크'}
              </button>

              {/* Delete */}
              <button
                onClick={() => { if (confirm('박스를 삭제할까요?')) onDelete(box.boxId); }}
                className="flex items-center gap-1 text-xs px-2 py-1 border border-red-200 text-red-500 hover:bg-red-50 transition-colors ml-auto"
              >
                <Trash2 size={11} />
                삭제
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drag gap below */}
      {isDragTarget && dragPosition === 'below' && (
        <div className="h-10 bg-blue-100 border-2 border-dashed border-blue-300 rounded mx-1 mt-1 transition-all" />
      )}
    </div>
  );
}
