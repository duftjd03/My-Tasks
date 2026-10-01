# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

개인용 할 일 관리 앱(Todo Application)을 순수 자바스크립트로 구현하는 프로젝트입니다.

- **Tech Stack**: Vanilla JavaScript, HTML5, CSS3
- **Features**: 
  - 기본 CRUD (추가/읽기/수정/삭제)
  - 카테고리별 필터링 (업무/개인/공부)
  - 실시간 검색 필터링
  - 진행률 실시간 표시
  - 다크모드/라이트모드 토글
  - LocalStorage 데이터 영속성
  - 단축키 지원
  - 완료된 항목 일괄 삭제
  - 반응형 디자인 (모바일/태블릿/데스크톱)
- **Development Phases**: 
  - Step 1: 기본 HTML/CSS 레이아웃 ✓
  - Step 2: 할 일 추가/삭제 기능 ✓
  - Step 3: 완료 상태 토글 ✓
  - Step 4: 카테고리 필터링 및 진행률 계산 ✓
  - Step 5: LocalStorage 저장/복구 ✓
  - 추가 기능: 다크모드, 검색, 단축키 등 ✓ (완성!)

## Project Structure

```
study-02/
├── index.html          # 앱의 HTML 구조 (제목, 탭, 폼, 목록)
├── style.css           # 모든 스타일링 (반응형 레이아웃 포함)
├── app.js              # 자바스크립트 로직 (기능 구현용)
└── CLAUDE.md          # 이 파일
```

## Key Files & Architecture

### index.html
- **Header**: 앱 제목 및 설명
- **Progress Section**: 완료율 진행바 (동적 업데이트 필요)
- **Category Tabs**: "전체", "업무", "개인", "공부" 필터
- **Task Form**: 할 일 입력창 + 카테고리 드롭다운 + 추가 버튼
- **Task List**: UL/LI로 할 일 아이템 렌더링
- **Footer**: 사용 설명

### style.css
- **Design**: 그라데이션 배경, 모던 카드 UI
- **Responsive**: 모바일(480px 이하), 태블릿(768px 이하), 데스크톱 대응
- **Color Scheme**: 
  - Primary: `#6366f1` (인디고)
  - Categories: 업무(파랑), 개인(핑크), 공부(보라)
- **Typography**: 시스템 폰트 스택 사용 (빠른 로드)
- **States**:
  - `.task-item.completed`: 취소선 + 연한 회색
  - `.tab-btn.active`: 활성 탭 강조
  - Hover/Focus 상태 포함

### app.js (Step 2 구현 완료)
**핵심 변수 & 함수** (완성):
- `todos`: 할 일 배열 (전역 상태, JSON으로 localStorage 저장)
- `currentFilter`: 현재 필터 카테고리 ('all', 'work', 'personal', 'study')
- `searchQuery`: 현재 검색어
- `currentTheme`: 현재 테마 ('light' | 'dark')
- `getFilteredTodos()`: 카테고리 + 검색어로 필터링된 배열 반환
- `renderTodos()`: 필터된 할 일들을 DOM에 렌더링
- `setFilter(category)`: 필터 변경 + 탭 active 클래스 토글
- `updateProgress()`: 진행률 + 남은 할 일 개수 계산
- `updateRemainingCount()`: 남은 할 일 개수 업데이트
- `addTodo(text, category)`: 할 일 추가 + saveTodos()
- `deleteTodo(id)`: 할 일 삭제 + saveTodos()
- `toggleTodo(id)`: 완료 상태 토글 + saveTodos()
- `clearCompleted()`: 완료된 항목 모두 삭제
- `toggleTheme()`: 다크모드/라이트모드 전환 + localStorage 저장
- `updateThemeToggleIcon()`: 테마 토글 아이콘 업데이트
- `saveTodos()` / `loadTodos()`: LocalStorage 저장/복구
- `handleKeypress()`: 단축키 처리 (Ctrl+1~4)
- `attachEventListeners()`: 체크박스/삭제 버튼 이벤트
- `escapeHtml()`: XSS 방지
- `getCategoryLabel()`: 카테고리 코드 → 한글

**데이터 구조**:
```javascript
{
  id: 1696...789,        // Date.now() 타임스탬프
  text: "할 일 내용",
  category: "work|personal|study",
  completed: false,      // Step 3에서 토글 예정
  createdAt: "ISO문자열"
}
```

**동작 흐름** (Step 2-5 완성):

*페이지 초기 로드:*
1. DOMContentLoaded 이벤트 발생
2. `loadTodos()`: localStorage에서 데이터 복구 (없으면 빈 배열)
3. 필터 탭에 클릭 이벤트 리스너 등록
4. `renderTodos()` 호출: 복구된 데이터 표시

*할 일 추가/삭제/완료:*
1. 사용자가 입력폼에 텍스트 + 카테고리 선택
2. 엔터키 또는 '추가' 버튼 → submit 이벤트
3. `addTodo()`: 입력값 검증 → 새 객체 생성 → todos 배열에 push → `saveTodos()` → `renderTodos()`
4. 체크박스 클릭 → `toggleTodo(id)` → completed 토글 → `saveTodos()` → `renderTodos()`
5. 삭제 버튼 클릭 → 확인 팝업 → `deleteTodo()` → `saveTodos()` → `renderTodos()`

*필터링 & 진행률 (실시간):*
1. 상단 필터 탭 클릭 (전체/업무/개인/공부)
2. `setFilter()` 호출: currentFilter 변경 → 탭 active 클래스 토글 → `renderTodos()`
3. `renderTodos()`: `getFilteredTodos()` 호출하여 필터된 배열 얻음
4. 필터된 배열을 기반으로 DOM 생성 + `updateProgress()` 호출
5. `updateProgress()`: 필터된 결과에 맞게 완료율 계산 → 진행바/퍼센트 업데이트

*데이터 영속성:*
1. 모든 CRUD 연산 후 `saveTodos()` 자동 호출
2. localStorage에 `todos` 키로 JSON 문자열 저장
3. 브라우저 재시작/새로고침 후에도 데이터 유지

## Development Tips

### CSS 작업 시
- CSS 변수(`:root`)에 색상 정의되어 있음 - 쉽게 수정 가능
- 반응형 중단점: 768px (태블릿), 480px (모바일)
- `.task-item.completed` 클래스로 완료 상태 표시

### JavaScript 작업 시
- 할 일 객체 구조: `{ id, text, category, completed, createdAt }`
- DOM 요소 ID:
  - `#taskForm`: 폼
  - `#taskInput`: 입력창
  - `#categorySelect`: 카테고리 선택
  - `#taskList`: 목록 컨테이너
  - `#progressFill`: 진행바 채우기
  - `#completedCount`, `#totalCount`: 개수 표시
- `.tab-btn[data-category="..."]`: 카테고리 탭 (현재 "all" 활성)
- `.empty-state`: 빈 상태 메시지 (할 일 없을 때)

### Testing
- 브라우저 개발자도구 콘솔에서 로그 확인
- 모바일 반응형 테스트: DevTools 디바이스 모드
- LocalStorage 테스트: `localStorage.clear()` 후 새로고침

## 추가 구현 기능

**다크모드/라이트모드**:
- 우측 상단 🌙/☀️ 토글 버튼
- HTML에 `data-theme` 속성 설정
- CSS의 `@media (prefers-color-scheme)` + `html[data-theme]` 사용
- localStorage에 'theme' 키로 저장 (페이지 새로고침 후에도 유지)

**실시간 검색**:
- 입력창에 텍스트 입력 → `input` 이벤트 → `searchQuery` 변경 → `renderTodos()`
- `getFilteredTodos()`에서 카테고리 + 검색어로 필터링
- 대소문자 무시 (`.toLowerCase()` 사용)

**완료된 항목 일괄 삭제**:
- 🗑️ 버튼으로 완료된 항목 모두 삭제
- 완료된 항목 없으면 버튼 비활성화 (disabled)
- 삭제 전 확인 팝업 (개수 표시)

**남은 할 일 개수**:
- 진행률 섹션에 "남은 할 일: N" 표시
- 필터된 결과에서 미완료 항목 개수 계산

**단축키**:
- Ctrl+1: 전체 필터
- Ctrl+2: 업무 필터
- Ctrl+3: 개인 필터
- Ctrl+4: 공부 필터
- 단축키 힌트를 탭 옆에 표시 (모바일에서는 숨김)

## 추가 개선 아이디어 (선택사항)

1. 날짜 표시 (createdAt을 포매팅하여 표시)
2. 우선순위 기능 (High/Mid/Low)
3. 반복 작업 기능 (매일, 매주, 매월)
4. 태그 기능 (카테고리 외 추가 분류)
5. 알림 기능 (마감일 전 알림)
6. 벌크 작업 (일괄 완료)
7. 통계 대시보드 (주별/월별 완료 현황)
8. 음성 입력 기능
9. 구글 캘린더 연동
10. 협업 기능 (공유, 실시간 동기화)

## Common Commands

```bash
# 로컬에서 앱 실행 (Python SimpleHTTPServer 또는 LiveServer 확장 사용)
python -m http.server 8000
# 브라우저에서 http://localhost:8000 열기

# VS Code Live Server 확장 사용 시
# 파일 우클릭 > "Open with Live Server"
```

## Notes

- 순수 JavaScript만 사용 (라이브러리/프레임워크 없음)
- 브라우저 호환성: 최신 Chrome, Firefox, Safari, Edge
- 다크모드 지원: `prefers-color-scheme` 미디어 쿼리 포함
- 접근성 고려: 포커스 상태, 색상 대비 충분함
