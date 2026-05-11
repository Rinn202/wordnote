/**
 * Main Page - WordNote 칸반 메인
 * Layout:
 *   - 좌측: 네비게이션 사이드바 (다크)
 *   - 상단 중앙: 시계 + 시각적 애니메이션
 *   - 우측 상단: 사이트명(로고)
 *   - 중앙: 루틴 보드(좌) + 이벤트 보드(우)
 *   - 하단 우측: 태스크 패널
 * 
 * 보드 초기화 로직:
 *   - 최초 로드: ROUTINE + EVENT 보드 쌍 자동 생성
 *   - 이후: localStorage에 저장된 마지막 보드 ID 쌍 자동 로드
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { boardApi, taskApi, Board, Task, BoardType } from '@/lib/api';
import BoardPanel from '@/components/BoardPanel';
import TaskPanel from '@/components/TaskPanel';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { LogOut, User, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';

const LAST_BOARDS_KEY = 'wn_last_boards'; // { routineId, eventId }

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

function Clock() {
  const time = useClock();
  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dateStr = `${time.getFullYear()}.${String(time.getMonth()+1).padStart(2,'0')}.${String(time.getDate()).padStart(2,'0')} (${days[time.getDay()]})`;

  // Animated progress arcs
  const secPct = time.getSeconds() / 60;
  const minPct = (time.getMinutes() + time.getSeconds() / 60) / 60;
  const hourPct = (time.getHours() % 12 + time.getMinutes() / 60) / 12;

  const arc = (pct: number, r: number) => {
    const circ = 2 * Math.PI * r;
    return `${circ * pct} ${circ * (1 - pct)}`;
  };

  return (
    <div className="flex items-center gap-4">
      {/* SVG clock rings */}
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
          {/* Hour */}
          <circle cx="32" cy="32" r="28" fill="none" stroke="#E5E7EB" strokeWidth="3" />
          <circle cx="32" cy="32" r="28" fill="none" stroke="#6B7280" strokeWidth="3"
            strokeDasharray={arc(hourPct, 28)} strokeLinecap="round" className="transition-all duration-1000" />
          {/* Minute */}
          <circle cx="32" cy="32" r="21" fill="none" stroke="#E5E7EB" strokeWidth="3" />
          <circle cx="32" cy="32" r="21" fill="none" stroke="#EAB308" strokeWidth="3"
            strokeDasharray={arc(minPct, 21)} strokeLinecap="round" className="transition-all duration-1000" />
          {/* Second */}
          <circle cx="32" cy="32" r="14" fill="none" stroke="#E5E7EB" strokeWidth="2" />
          <circle cx="32" cy="32" r="14" fill="none" stroke="#F97316" strokeWidth="2"
            strokeDasharray={arc(secPct, 14)} strokeLinecap="round" className="transition-all duration-300" />
        </svg>
      </div>
      <div>
        <div className="mono text-2xl font-bold text-gray-800 leading-none tracking-tight">
          {hh}<span className="animate-pulse">:</span>{mm}<span className="text-lg text-gray-400">:{ss}</span>
        </div>
        <div className="mono text-xs text-gray-400 mt-1">{dateStr}</div>
      </div>
    </div>
  );
}

export default function Main() {
  const [, navigate] = useLocation();
  const { member, logout } = useAuth();
  const [routineBoard, setRoutineBoard] = useState<Board | null>(null);
  const [eventBoard, setEventBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedBoardType, setSelectedBoardType] = useState<BoardType>('EVENT');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 선택된 보드
  const selectedBoard = selectedBoardType === 'ROUTINE' ? routineBoard : eventBoard;
  const setSelectedBoard = selectedBoardType === 'ROUTINE'
    ? setRoutineBoard
    : setEventBoard;

  // 초기 보드 로드
  useEffect(() => {
    initBoards();
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const t = await taskApi.getAll();
      setTasks(t);
    } catch { /* 태스크 없어도 무방 */ }
  };

  const initBoards = async () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem(LAST_BOARDS_KEY);
      if (saved) {
        const { routineId, eventId } = JSON.parse(saved);
        try {
          const [r, e] = await Promise.all([
            boardApi.getById(routineId),
            boardApi.getById(eventId),
          ]);
          setRoutineBoard(r);
          setEventBoard(e);
          setLoading(false);
          return;
        } catch {
          // 저장된 보드가 없으면 새로 생성
        }
      }
      // 최초: 새 보드 쌍 생성
      const [r, e] = await Promise.all([
        boardApi.create('ROUTINE'),
        boardApi.create('EVENT'),
      ]);
      setRoutineBoard(r);
      setEventBoard(e);
      localStorage.setItem(LAST_BOARDS_KEY, JSON.stringify({ routineId: r.boardId, eventId: e.boardId }));
    } catch (err: any) {
      toast.error('보드 초기화 실패: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  // 루틴 보드 저장 (현재 상태를 localStorage에 기록)
  const handleSave = useCallback(async () => {
    if (!routineBoard || !eventBoard) return;
    localStorage.setItem(LAST_BOARDS_KEY, JSON.stringify({
      routineId: routineBoard.boardId,
      eventId: eventBoard.boardId,
    }));
    toast.success('보드가 저장되었습니다.');
  }, [routineBoard, eventBoard]);

  // 루틴 보드 로드 (저장된 보드 불러오기)
  const handleLoad = useCallback(async () => {
    const saved = localStorage.getItem(LAST_BOARDS_KEY);
    if (!saved) { toast.error('저장된 보드가 없습니다.'); return; }

    // 진행 중인 박스가 있으면 확인
    const hasActive = routineBoard?.boxes.some(b => b.state !== 'DONE') ||
                      eventBoard?.boxes.some(b => b.state !== 'DONE');
    if (hasActive) {
      const ok = confirm('진행중인 보드를 저장할까요?\n(취소 시 저장 없이 불러옵니다)');
      if (ok) await handleSave();
    }

    try {
      const { routineId, eventId } = JSON.parse(saved);
      const [r, e] = await Promise.all([
        boardApi.getById(routineId),
        boardApi.getById(eventId),
      ]);
      setRoutineBoard(r);
      setEventBoard(e);
      toast.success('보드를 불러왔습니다.');
    } catch (err: any) {
      toast.error('불러오기 실패: ' + (err.message || ''));
    }
  }, [routineBoard, eventBoard, handleSave]);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F0]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400 mono">보드 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F5F4F0]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside className={cn(
        'flex-shrink-0 bg-[#1A1A1A] flex flex-col transition-all duration-300',
        sidebarOpen ? 'w-48' : 'w-12'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 py-4 border-b border-gray-700">
          <div className="w-6 h-6 bg-white flex items-center justify-center flex-shrink-0">
            <span className="text-[#1A1A1A] text-xs font-bold mono">W</span>
          </div>
          {sidebarOpen && <span className="text-white text-sm font-bold tracking-tight">WordNote</span>}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 flex flex-col gap-1 px-2">
          <NavItem icon={<LayoutDashboard size={15} />} label="칸반" open={sidebarOpen} active />
          <NavItem icon={<User size={15} />} label="마이페이지" open={sidebarOpen}
            onClick={() => navigate('/mypage')} />
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-gray-700 flex flex-col gap-1">
          {sidebarOpen && member && (
            <div className="px-2 py-1.5 mb-1">
              <p className="text-xs text-gray-300 truncate">{member.nickname}</p>
              <p className="text-xs text-gray-500 truncate">{member.email}</p>
            </div>
          )}
          <NavItem icon={<LogOut size={15} />} label="로그아웃" open={sidebarOpen} onClick={handleLogout} />
          <button
            onClick={() => setSidebarOpen(s => !s)}
            className="flex items-center justify-center p-2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-[#F5F4F0] flex-shrink-0">
          <Clock />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-base font-bold tracking-tight text-gray-800">WordNote</p>
              <p className="text-xs text-gray-400 mono">업무 관리 시스템</p>
            </div>
            {member?.profileUri && (
              <img src={member.profileUri} alt="profile" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
            )}
          </div>
        </header>

        {/* Board area */}
        <div className="flex-1 flex gap-3 p-4 overflow-hidden min-h-0">

          {/* Left: Routine + Event boards */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">

            {/* Board pair */}
            <div className="flex gap-3 flex-1 min-h-0">
              {/* Routine board */}
              <div className="flex-1 min-w-0 flex flex-col">
                {routineBoard ? (
                  <BoardPanel
                    board={routineBoard}
                    isSelected={selectedBoardType === 'ROUTINE'}
                    onSelect={() => setSelectedBoardType('ROUTINE')}
                    onUpdate={setRoutineBoard}
                    onSave={handleSave}
                    onLoad={handleLoad}
                    isRoutine={true}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-300 text-sm mono">
                    루틴 보드 없음
                  </div>
                )}
              </div>

              {/* Event board */}
              <div className="flex-1 min-w-0 flex flex-col">
                {eventBoard ? (
                  <BoardPanel
                    board={eventBoard}
                    isSelected={selectedBoardType === 'EVENT'}
                    onSelect={() => setSelectedBoardType('EVENT')}
                    onUpdate={setEventBoard}
                    isRoutine={false}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-300 text-sm mono">
                    이벤트 보드 없음
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Task panel */}
          <div className="w-64 flex-shrink-0 flex flex-col">
            {/* Selected board indicator */}
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs text-gray-400 mono">선택된 보드:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedBoardType('ROUTINE')}
                  className={cn('px-2 py-0.5 text-xs mono transition-colors border',
                    selectedBoardType === 'ROUTINE'
                      ? 'bg-gray-700 text-white border-gray-700'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400')}
                >
                  ROUTINE
                </button>
                <button
                  onClick={() => setSelectedBoardType('EVENT')}
                  className={cn('px-2 py-0.5 text-xs mono transition-colors border',
                    selectedBoardType === 'EVENT'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400')}
                >
                  EVENT
                </button>
              </div>
            </div>

            <TaskPanel
              tasks={tasks}
              selectedBoard={selectedBoard}
              onTasksChange={setTasks}
              onBoardUpdate={(updated) => {
                if (selectedBoardType === 'ROUTINE') setRoutineBoard(updated);
                else setEventBoard(updated);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, open, active, onClick }: {
  icon: React.ReactNode; label: string; open: boolean; active?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 px-2 py-2 rounded-sm transition-colors text-left w-full',
        active ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      {open && <span className="text-xs font-medium truncate">{label}</span>}
    </button>
  );
}
