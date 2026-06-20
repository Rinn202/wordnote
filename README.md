# WordNote

간호사 업무 관리에 특화된 칸반 보드형 To-Do 웹 애플리케이션입니다.
루틴 업무와 이벤트성 업무를 분리해서 관리하고, 작은 작업들을 "박스" 단위로 묶어 알람·즐겨찾기·만료 시간을 설정할 수 있습니다.

- **GitHub**: https://github.com/Rinn202/wordnote
- **배포 링크**: 준비 중 (재배포 예정)

---

## 주요 기능

### 보드 / 박스 / 태스크
- **루틴 보드 / 이벤트 보드** 2종류로 업무를 분리 관리
- 보드(Board) - 박스(Box) - 태스크(Task)의 1:N, N:M 구조
  - 박스는 여러 태스크를 묶는 작업 단위
  - 태스크는 여러 박스에서 재사용 가능 (BoxTask로 N:M 연결)
- 드래그 앤 드롭으로 박스/태스크 순서 변경
- 탭별 필터링 (전체 / 할 일 / 완료 / 즐겨찾기)
- 보드 저장/불러오기, 최대 10개까지 보드 생성 가능

### 박스 옵션
- 만료 시간 설정 및 만료 시 시각적 표시
- 알람 설정 (정시 / 10분 전 / 30분 전)
- 즐겨찾기 토글
- 알람 발생 시 토스트 알림 + 사이드바 알람 목록 표시

### 태스크 풀 (Task Pool)
- 카테고리별 아코디언 형태로 태스크 분류 표시
- 커스텀 태스크 생성/수정/삭제
- 체크박스 클릭 시 낙관적 업데이트(Optimistic UI) 적용, 실패 시 자동 롤백

### 인증 / 회원
- JWT 기반 로그인 + Google OAuth 연동
- Access Token은 로컬 스토리지, 인증 쿠키 병행 사용
- Axios 인터셉터를 통한 토큰 자동 첨부 및 401/403 처리(자동 로그아웃)

### 관리자 기능
- 관리자(ADMIN) 권한 사용자만 접근 가능한 공지사항 관리 페이지
- 공지 등록/수정/삭제, Topbar에 마퀴 형태로 최신 공지 표시
- 공용 태스크(전체 사용자에게 제공되는 `memberId = NULL` 태스크) 생성/수정/삭제 관리

### UI/UX
- 시간대별로 자동 전환되는 Topbar 테마 (새벽/아침/점심/저녁/밤 5종)
- 페이지 이탈 방지 (요청 처리 중 새로고침/닫기 경고)
- 모달, 확인창 등 공통 컴포넌트 분리

---

## 기술 스택

### Frontend
- React + TypeScript
- React Router
- Axios
- Tabler Icons

### Backend
- Java / Spring Boot
- Spring Security + JWT, Google OAuth2
- Spring Data JPA / Hibernate
- MySQL

### 배포
- Railway (프론트엔드 / 백엔드 / DB 통합 배포)

---

## 백엔드 아키텍처

### 도메인 구조
패키지를 도메인 단위(`board`, `box`, `task`, `boxtask`, `member`, `notice` 등)로 분리하고, 각 도메인마다 `entity / repository / service / controller / dto / mapper` 계층을 일관되게 구성했습니다.

### ERD 핵심 구조
- **Member - Board**: 1:N (한 사용자가 여러 보드를 가질 수 있음, 최대 10개 제한)
- **Board - Box**: 1:N (보드 안에 여러 박스가 존재, `sortIndex`로 순서 관리)
- **Box - Task**: N:M (`BoxTask` 중간 테이블로 연결, `sortIndex`와 `isDone` 상태를 개별 관리)
- `member_id = NULL`인 템플릿 보드를 따로 두고, 신규 가입 시 이 템플릿을 복제(`copySampleBoard`)해서 기본 루틴 보드를 제공

### 주요 구현 포인트
- **벌크 연산 기반 보드 리셋**: 박스/태스크 완료 상태 초기화, 이벤트 박스 삭제를 각각 1번의 벌크 UPDATE/DELETE 쿼리로 처리해 N+1 문제 방지
- **순서 변경 로직**: 박스/태스크 드래그앤드롭 시 ID 리스트만 조회해 메모리에서 재배치한 뒤 `sortIndex`를 벌크 UPDATE로 일괄 반영 (엔티티 전체 로딩 없이 처리)
- **상태 자동 계산**: 태스크 체크 시 `BoxTask.isDone` 변경 → 박스 내 전체/완료 개수를 COUNT 쿼리로 비교해 박스 상태(`READY`/`IN_PROGRESS`/`DONE`)를 자동 갱신, 전체 완료/전체 미완료 시 하위 태스크 상태를 벌크 UPDATE로 동기화
- **연관관계 편의 메서드**: `Box.setBoard()`에서 양방향 연관관계를 직접 관리해 데이터 정합성 보장
- **Task 공용/개인 분리**: `memberId IS NULL`인 공용 태스크(샘플 데이터)와 사용자가 직접 만든 개인 태스크를 같은 테이블에서 조회 조건(`memberId IS NULL OR memberId = :memberId`)으로 통합 관리, 수정/삭제는 본인 소유 태스크만 가능
- **예외 처리**: `LogicException` + `ExceptionCode`로 도메인별 에러 코드 일관 관리
- **샘플 데이터**: 간호사 업무 카테고리(인수인계, 정규 라운딩, 오더 확인, 투약, 전산 차팅 등)를 `data.sql`로 초기 적재, 신규 사용자에게 기본 루틴 보드로 제공

---

## 인증 / 보안 구조

### JWT 인증 흐름
- **Access Token**: 30분 유효, 클라이언트가 `Authorization: Bearer {token}` 헤더로 전달
- **Refresh Token**: 7시간(14일 쿠키 만료) 유효, `httpOnly` 쿠키로 저장하여 XSS로부터 보호
- `JwtVerificationFilter`(`OncePerRequestFilter`)가 요청마다 Authorization 헤더를 검증하고, 토큰의 `memberId`/`email`/`role` 클레임으로 `SecurityContext`에 인증 정보를 주입
- 토큰이 없거나 `Bearer`로 시작하지 않는 요청은 필터를 건너뛰고(`shouldNotFilter`), 인증이 필요한 API에서는 `authenticationEntryPoint`가 401을 반환해 프론트에서 토큰을 정리하고 재로그인 처리

### Google OAuth2 로그인
- `CustomOAuth2UserService`에서 구글 응답(email, name, picture)을 받아 `MemberService.processOAuth2User`로 회원 조회/자동 가입
- `OAuth2MemberSuccessHandler`에서 로그인 성공 시 Access/Refresh Token을 직접 발급하고, Refresh Token은 회원 정보에 저장 + httpOnly 쿠키로 전달
- Access Token은 프론트엔드 리다이렉트 URI(`/login/redirect`)에 쿼리 파라미터로 전달해, 일반 로그인과 동일한 방식으로 클라이언트에서 저장

### 인증 객체 통합 (PrincipalDetails)
- 일반 로그인(JWT)과 OAuth2 로그인 양쪽에서 동일한 `PrincipalDetails` 객체로 인증 정보를 표현
- `SecurityUtil.getMemberId()`가 두 인증 방식의 Principal 타입을 모두 처리해, 컨트롤러 레벨에서는 인증 방식과 무관하게 `memberId`만으로 비즈니스 로직 작성 가능

### 토큰 재발급
- `/auth/refresh`: 쿠키에 담긴 Refresh Token을 검증(`type=refresh` 클레임 확인) 후 새 Access/Refresh Token 발급 (Refresh Token Rotation)

### 보안 설정 (SecurityConfig)
- Stateless 세션 정책 (`SessionCreationPolicy.STATELESS`)
- `/auth/**`, `/member/signup`, 정적 리소스 등은 인증 없이 허용, 나머지는 전부 인증 필요
- CORS: 로컬(`localhost:5173`)과 배포 도메인만 허용, `Authorization`/`Refresh` 헤더 노출, 쿠키 인증을 위한 `allowCredentials(true)` 설정

### 역할 기반 접근 제어 (RBAC)
- `Role`(ADMIN/BASIC/PREMIUM) Enum으로 권한 구분
- 특정 이메일은 가입 시 자동으로 ADMIN 권한 부여 (`adminMaker`)
- 공지사항 생성/수정/삭제는 `@PreAuthorize("hasRole('ADMIN')")`로 제한, JWT 클레임의 `role`이 `SimpleGrantedAuthority`로 변환되어 권한 체크에 사용됨

### API 예시 (Board)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/board` | 보드 생성 (최대 10개 제한) |
| GET | `/board` | 내 보드 전체 조회 |
| GET | `/board/{id}` | 보드 단일 조회 |
| PATCH | `/board/{id}` | 보드 수정 |
| PUT | `/board/{id}/reset` | 보드 리셋 (완료 상태 초기화, 이벤트 박스 삭제) |
| PUT | `/board/{id}/boxesOrder` | 박스 순서 변경 |
| POST | `/board/{id}/sample` | 템플릿 보드 복제 |
| DELETE | `/board/{id}` | 보드 삭제 |
| DELETE | `/board` | 전체 보드 삭제 |

### API 예시 (Box / BoxTask)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/box` | 박스 생성 (선택한 Task들과 N:M 연결) |
| GET | `/box` | 내 박스 전체 조회 |
| GET | `/box/{id}` | 박스 단일 조회 |
| PATCH | `/box/{id}/option` | 옵션 변경 (즐겨찾기, 알람타입, 만료시간) |
| PATCH | `/box/{id}/state` | 박스 상태 변경 (READY/IN_PROGRESS/DONE) |
| DELETE | `/box/{id}` | 박스 삭제 |
| PATCH | `/boxTask/{id}/done` | 태스크 완료 토글 (박스 상태 자동 재계산) |
| PUT | `/boxTask/{id}/move` | 박스 내 태스크 순서 변경 |

### API 예시 (Member / Notice)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/member/signup` | 회원가입 (이메일 중복 검사, 비밀번호 암호화) |
| GET | `/member/mypage` | 내 정보 조회 |
| GET | `/member` | 전체 회원 조회 |
| PATCH | `/member` | 회원 정보 수정 |
| PATCH | `/member/password` | 비밀번호 변경 |
| DELETE | `/member` | 회원 탈퇴 |
| GET | `/notice` | 공지 전체 조회 (최신순) |
| GET | `/notice/{id}` | 공지 단일 조회 |
| POST | `/notice` | 공지 생성 (ADMIN) |
| PATCH | `/notice/{id}` | 공지 수정 (ADMIN) |
| DELETE | `/notice/{id}` | 공지 삭제 (ADMIN) |

### API 예시 (Task)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/task` | 태스크 전체 조회 (공용 + 내 태스크) |
| POST | `/task` | 태스크 생성 |
| PATCH | `/task/{id}` | 태스크 수정 (본인 소유만) |
| DELETE | `/task/{id}` | 태스크 삭제 (본인 소유만) |

### API 예시 (Auth)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/auth/login` | 로그인 (Access Token 응답 + Refresh Token 쿠키 발급) |
| POST | `/auth/refresh` | Refresh Token으로 Access/Refresh Token 재발급 |
| - | `/oauth2/authorization/google` | Google OAuth2 로그인 진입점 (Spring Security 기본 제공) |

---

## 인증 / 보안 아키텍처

### 인증 흐름
1. **일반 로그인**: `/auth/login`에서 이메일/비밀번호 검증(`PasswordEncoder` 매칭) 후, AccessToken은 응답 바디로 반환하고 RefreshToken은 `HttpOnly` 쿠키로 전달
2. **Google OAuth2 로그인**: Spring Security의 `oauth2Login` 플로우를 통해 구글 인증 → `CustomOAuth2UserService`에서 이메일로 회원 조회/자동가입(`processOAuth2User`) → `OAuth2MemberSuccessHandler`에서 JWT 발급 후 프론트엔드로 리다이렉트(AccessToken은 쿼리 파라미터, RefreshToken은 쿠키)
3. **토큰 재발급**: `/auth/refresh`에서 쿠키의 RefreshToken을 검증(`type: refresh` 클레임 확인)하고 Access/Refresh 토큰을 재발급

### JWT 검증 필터
- `JwtVerificationFilter`(`OncePerRequestFilter`)가 `UsernamePasswordAuthenticationFilter` 앞단에서 동작
- `Authorization: Bearer {token}` 헤더가 없으면 필터를 건너뛰고(`shouldNotFilter`), 있으면 토큰을 파싱해 `memberId`, `email`, `role` 클레임을 추출
- 추출한 정보로 `PrincipalDetails`를 만들어 `SecurityContextHolder`에 인증 정보로 등록 → 이후 컨트롤러에서 `SecurityUtil.getMemberId()`로 인증된 사용자 식별

### PrincipalDetails
- `UserDetails`와 `OAuth2User`를 동시에 구현해, **일반 로그인과 OAuth2 로그인을 동일한 인증 객체로 처리**
- `Role` Enum을 `GrantedAuthority`로 변환해 Spring Security의 권한 체계(`hasRole`)와 연동

### Spring Security 설정
- `STATELESS` 세션 정책 (JWT 기반, 서버에 세션 미저장)
- CORS: 로컬(`localhost:5173`)과 배포 도메인(Railway)만 허용, 쿠키 인증을 위해 `allowCredentials(true)` 설정
- 인증 실패 시 302 리다이렉트 대신 401 JSON 응답을 반환하도록 `authenticationEntryPoint` 커스터마이징 → 프론트엔드 Axios 인터셉터에서 401/403 감지 후 자동 로그아웃 처리와 연결

---

## 프로젝트 구조 (Frontend 일부)

```
src/
├── api/              # API 모듈 (axios 기반)
│   ├── client.ts     # 공통 axios 인스턴스, 인터셉터
│   ├── board.ts
│   ├── box.ts
│   ├── member.ts
│   └── notice.ts
├── components/
│   ├── board/        # BoardColumn, BoxCard, BoxOptionPanel 등
│   ├── common/        # Modal, ConfirmModal, AlarmToast 등
│   ├── layout/        # Topbar, LeftSidebar
│   └── task/          # TaskPool
├── hooks/
│   ├── useAlarm.ts
│   ├── useDragDrop.ts
│   └── useTopbarTheme.tsx
├── pages/
│   ├── AuthGate.tsx
│   ├── OAuthRedirect.tsx
│   └── AdminPage.tsx
└── styles/
```

---

## 개발 배경

병원에서 간호사로 근무하며 직접 느꼈던 "업무 단위 관리"의 어려움을 해결하기 위해 기획했습니다.
단순한 To-Do 앱이 아니라, 루틴 업무와 돌발 이벤트를 구분하고, 여러 개의 세부 작업을 하나의 박스로 묶어 관리할 수 있도록 도메인에 맞춰 설계했습니다.

부트캠프에서 학습한 백엔드(Java/Spring) 기술을 기반으로 기획, 설계, 프론트엔드 구현, 배포까지 1인 개발로 진행했습니다.

---

## 향후 계획
- WebSocket 기반 실시간 알림으로 전환
- 코드 리팩토링 및 인라인 스타일 정리
- 재배포 및 데모 링크 추가
