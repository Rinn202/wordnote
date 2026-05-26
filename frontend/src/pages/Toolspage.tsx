import '../styles/tools-page.css';

interface Props {
    onBack: () => void;
}

const TOOLS = [
    {
        id: 'card-maker',
        icon: '💉',
        title: '주사제 라벨 생성기',
        desc: '주사제 정보를 입력하여 출력용 라벨을 생성합니다.',
        file: '/wordutile/pages/card-maker.html',
    },
    {
        id: 'expiry-filter',
        icon: '📋',
        title: '만료 처방 필터기',
        desc: '만료된 처방을 필터링하여 목록으로 확인합니다.',
        file: '/wordutile/pages/expiry-filter.html',
    },
];

export default function ToolsPage({onBack}: Props) {
    return (
        <div className="tools-container">
            <div className="tools-inner">

                {/* 헤더 */}
                <div className="tools-header">
                    <button className="icon-btn" onClick={onBack} title="뒤로가기">
                        <i className="ti ti-arrow-left" aria-hidden="true"/>
                    </button>
                    <span className="tools-header-title">도구</span>
                </div>

                {/* 툴 카드 목록 */}
                <div className="tools-list">
                    {TOOLS.map(tool => (
                        <a
                            key={tool.id}
                            href={tool.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tools-card"
                        >
                            <span className="tools-card-icon">{tool.icon}</span>
                            <div className="tools-card-info">
                                <span className="tools-card-title">{tool.title}</span>
                                <span className="tools-card-desc">{tool.desc}</span>
                            </div>
                            <i className="ti ti-external-link tools-card-arrow" aria-hidden="true"/>
                        </a>
                    ))}
                </div>

            </div>
        </div>
    );
}