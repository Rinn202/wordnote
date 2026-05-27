interface Props {
    onNavigate: (page: 'board' | 'tools' | 'mypage' | 'about') => void;
}

const cards = [
    {
        id: 'board' as const,
        icon: 'ti-layout-kanban',
        title: '보드',
        desc: '오늘의 할 일을 정리해보세요',
        className: 'mc-board',
    },
    {
        id: 'tools' as const,
        icon: 'ti-tool',
        title: '도구',
        desc: '주사제 라벨 생성기 · 만료 오더 필터',
        className: 'mc-tools',
    },
    {
        id: 'mypage' as const,
        icon: 'ti-user',
        title: '마이페이지',
        desc: '프로필과 설정을 관리하세요',
        className: 'mc-my',
    },
    {
        id: 'about' as const,
        icon: 'ti-info-circle',
        title: '서비스 소개',
        desc: '기술 스택 · 개발자 정보 · 이용약관',
        className: 'mc-about',
    },
];

export default function MenuPage({onNavigate}: Props) {
    const nickname = localStorage.getItem('nickname') ?? '사용자';

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .menu-wrapper {
                    background: var(--bg);
                    padding: 80px 20px 40px;
                    display: flex;
                    justify-content: center;
                    font-family: 'GowunBatang', serif;
                }
                .menu-inner {
                    width: 100%;
                    max-width: 420px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    animation: fadeUp 0.35s ease both;
                }

                /* 헤더 */
                .menu-header {
                    display: flex;
                    align-items: center;
                    padding-bottom: 2px;
                }
                .menu-header-title {
                    font-family: 'OngleipParkDahyeon', serif;
                    font-size: 24px;
                    color: var(--text);
                }

                /* 웰컴 */
                .menu-welcome {
                    background: #F0F4FF;
                    border-radius: 10px;
                    padding: 14px 18px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .menu-welcome-text {
                    font-size: 13px;
                    color: #8a96b0;
                    font-family: 'GowunBatang', serif;
                }
                .menu-welcome-name {
                    font-weight: 700;
                    color: #4a5580;
                }

                /* 그리드 */
                .menu-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                /* 카드 공통 */
                .menu-card {
                    background: #fff;
                    border-radius: 14px;
                    padding: 22px 18px 20px;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                    text-align: left;
                    border-width: 1.5px;
                    border-style: dashed;
                    transition:
                            transform 0.15s ease,
                            box-shadow 0.15s ease,
                            border-color 0.15s ease;
                
                    appearance: none;
                    -webkit-appearance: none;
                }
                
                .menu-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.06);
                }
                
                .menu-card-icon {
                    font-size: 20px;
                }
                .menu-card-title {
                    font-family: 'GowunBatang', serif;
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text);
                    line-height: 1.3;
                }
                .menu-card-desc {
                    font-size: 11px;
                    font-family: 'IBM Plex Mono', monospace;
                    color: var(--text3);
                    line-height: 1.65;
                }

                .mc-board {border-color: #d05040;}
                .mc-board  .menu-card-icon { color: #d05040; }
                
                .mc-tools {border-color: #c08020;}
                .mc-tools  .menu-card-icon { color: #c08020; }
                
                .mc-my {border-color: #3a8a3a;}
                .mc-my     .menu-card-icon { color: #3a8a3a; }
                
                .mc-about {border-color: #4060c0;}
                .mc-about  .menu-card-icon { color: #4060c0; }
                



            `}</style>

            <div className="menu-wrapper">
                <div className="menu-inner">

                    {/* 헤더 */}
                    <div className="menu-header">
                        <span className="menu-header-title">WordNote 📋</span>
                    </div>

                    {/* 웰컴 */}
                    <div className="menu-welcome">
                        <span className="menu-welcome-text">
                            <span className="menu-welcome-name">{nickname}</span>님 · 오늘도 좋은 하루 되세요
                        </span>
                    </div>

                    {/* 메뉴 카드 그리드 */}
                    <div className="menu-grid">
                        {cards.map(card => (
                            <button
                                key={card.id}
                                className={`menu-card ${card.className}`}
                                onClick={() => onNavigate(card.id)}
                            >
                                <i className={`ti ${card.icon} menu-card-icon`} aria-hidden="true"/>
                                <div className="menu-card-title">{card.title}</div>
                                <div className="menu-card-desc">{card.desc}</div>
                            </button>
                        ))}
                    </div>

                </div>
            </div>
        </>
    );
}
