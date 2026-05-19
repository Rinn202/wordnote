interface Props {
    boardId: number | undefined;
    total: number;
    todo: number;
    prog: number;
    done: number;
}

export default function Footer({boardId, total, todo, prog, done}: Props) {
    return (
        <footer className="app-footer" style={{marginTop: '12px'}}>
            <div className="footer-left">
                <div className="footer-dot"/>
                보드 #{boardId ?? '-'} · 박스 {total}개
            </div>
            <div className="footer-right">
                <span className="footer-stat">할일 <span>{todo}</span></span>
                <span className="footer-stat">진행 <span>{prog}</span></span>
                <span className="footer-stat">완료 <span>{done}</span></span>
            </div>
        </footer>
    );
}