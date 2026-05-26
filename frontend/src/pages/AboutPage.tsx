import '../styles/about-page.css';

const TECH_STACK = ['React 19', 'TypeScript', 'Vite', 'Spring Boot', 'MySQL', 'Redis'];

interface Props {
    onBack: () => void;
}

export default function AboutPage({onBack}: Props) {
    return (
        <div className="about-container">
            <div className="about-inner">

                {/* 헤더 */}
                <div className="about-header">
                    <button className="icon-btn" onClick={onBack} title="뒤로가기">
                        <i className="ti ti-arrow-left" aria-hidden="true"/>
                    </button>
                    <span className="about-header-title">서비스 소개</span>
                </div>

                {/* 서비스 소개 */}
                <div className="about-card">
                    <span className="about-card-label">ABOUT</span>
                    <span className="about-service-title">WordNote</span>
                    <span className="about-service-desc">
                        하루 일과를 정규화하여 재사용 하고 예외 일과를 이벤트로 분류하여 처리하는 칸반 보드 서비스입니다.{'\n'}
                        직관적인 UI로 업무 흐름을 한눈에 파악하고, 알림 기능으로 중요한 일정을 놓치지 마세요.
                    </span>
                    <div className="about-divider"/>
                    <div className="about-version-row">
                        <span className="about-version-key">버전</span>
                        <span className="about-version-val">v1.0.0</span>
                    </div>
                </div>

                {/* 기술 스택 */}
                <div className="about-card">
                    <span className="about-card-label">TECH STACK</span>
                    <div className="about-tech-chips">
                        {TECH_STACK.map(tech => (
                            <span key={tech} className="about-tech-chip">{tech}</span>
                        ))}
                    </div>
                </div>

                {/* 이메일 */}
                <div className="about-card">
                    <span className="about-card-label">CONTACT</span>
                    <div className="about-email-row">
                        <i className="ti ti-mail about-email-icon" aria-hidden="true"/>
                        <a href="mailto:dioneo54@gmail.com" className="about-email-link">
                            dioneo54@gmail.com
                        </a>
                    </div>
                </div>

                {/* 라이센스 */}
                <div className="about-card">
                    <span className="about-card-label">LICENSE</span>
                    <span className="about-license-title">CC BY-NC-ND 4.0</span>
                    <div className="about-license-badges">
                        <span className="about-license-badge">
                            <i className="ti ti-creative-commons" aria-hidden="true"/>
                            저작자 표시
                        </span>
                        <span className="about-license-badge">
                            <i className="ti ti-currency-dollar-off" aria-hidden="true"/>
                            비상업적 이용
                        </span>
                        <span className="about-license-badge">
                            <i className="ti ti-copy-off" aria-hidden="true"/>
                            변경 금지
                        </span>
                    </div>
                    <span className="about-license-desc">
                        이 서비스의 콘텐츠 및 소스코드는 무단 재배포 및 상업적 이용을 금지합니다.{'\n'}
                        출처를 밝힌 비상업적 목적의 사용은 허용됩니다.
                    </span>
                </div>

                {/* 카피라이트 */}
                <span className="about-copyright">
                    © 2025 WordNote. All rights reserved.
                </span>

            </div>
        </div>
    );
}