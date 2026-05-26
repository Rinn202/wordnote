interface Props {
    onNavigate: (page: 'board' | 'tools' | 'mypage' | 'about') => void;
}

const cards = [
    {
        id: 'board' as const,
        icon: '📋',
        title: '보드',
        desc: '오늘의 할 일을 정리해보세요',
    },
    {
        id: 'tools' as const,
        icon: '🛠',
        title: '도구',
        desc: '주사제 라벨 생성기 · 만료 오더 필터',
    },
    {
        id: 'mypage' as const,
        icon: '👤',
        title: '마이페이지',
        desc: '프로필과 설정을 관리하세요',
    },
    {
        id: 'about' as const,
        icon: 'ℹ️',
        title: '서비스 소개',
        desc: '기술 스택 · 개발자 정보 · 이용약관',
    },
];

export default function MenuPage({ onNavigate }: Props) {
    const nickname = localStorage.getItem('nickname') ?? '사용자';

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .menu-card {
                    transition: all 0.15s ease;
                }
                .menu-card:hover {
                    border-color: #94a3b8 !important;
                    background: #f8fafc !important;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
                }
            `}</style>

            <div style={{
                minHeight: '100vh',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 16px',
                fontFamily: '"Pretendard", "Apple SD Gothic Neo", sans-serif',
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: 420,
                    animation: 'fadeUp 0.3s ease',
                }}>
                    {/* 헤더 */}
                    <div style={{
                        background: '#fff',
                        border: '2px solid #e2e8f0',
                        borderRadius: 18,
                        padding: '28px 28px 24px',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
                        marginBottom: 12,
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>📋</div>
                        <div style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: '#0f172a',
                            letterSpacing: '-0.01em',
                        }}>
                            WordNote
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                            안녕하세요, <span style={{ color: '#475569', fontWeight: 600 }}>{nickname}</span>님 👋
                        </div>
                    </div>

                    {/* 카드 그리드 */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 10,
                    }}>
                        {cards.map(card => (
                            <button
                                key={card.id}
                                className="menu-card"
                                onClick={() => onNavigate(card.id)}
                                style={{
                                    background: '#fff',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: 14,
                                    padding: '20px 16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: 8,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                    textAlign: 'left',
                                }}
                            >
                                <span style={{ fontSize: 22 }}>{card.icon}</span>
                                <div style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: '#0f172a',
                                }}>
                                    {card.title}
                                </div>
                                <div style={{
                                    fontSize: 11,
                                    color: '#94a3b8',
                                    lineHeight: 1.5,
                                }}>
                                    {card.desc}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}