// 할 일 관리 앱 - 추가 기능 포함 (다크모드, 검색, 삭제 등)

// 상태: 메모리에 할 일 데이터 관리
let todos = [];
let currentFilter = 'all'; // 현재 선택된 필터 카테고리
let searchQuery = ''; // 현재 검색어
let currentTheme = 'light'; // 현재 테마

// DOM 요소 캐싱
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const themToggle = document.getElementById('themToggle');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// 필터된 할 일 목록 반환 (카테고리 + 검색)
function getFilteredTodos() {
    let filtered = todos;

    // 카테고리 필터
    if (currentFilter !== 'all') {
        filtered = filtered.filter(todo => todo.category === currentFilter);
    }

    // 검색 필터 (검색어가 있을 때만)
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(todo => todo.text.toLowerCase().includes(query));
    }

    return filtered;
}

// 테마 전환 함수
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeToggleIcon();
}

// 테마 아이콘 업데이트
function updateThemeToggleIcon() {
    themToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}

// 완료된 항목 모두 삭제 함수
function clearCompleted() {
    const completedCount = todos.filter(todo => todo.completed).length;
    if (completedCount === 0) {
        alert('완료된 할 일이 없습니다.');
        return;
    }

    if (confirm(`완료된 항목 ${completedCount}개를 삭제하시겠습니까?`)) {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
    }
}

// 남은 할 일 개수 업데이트
function updateRemainingCount() {
    const filteredTodos = getFilteredTodos();
    const remainingCount = filteredTodos.filter(todo => !todo.completed).length;
    document.getElementById('remainingCount').textContent = remainingCount;
}

// 할 일 렌더링: 필터된 할 일을 DOM에 표시
function renderTodos() {
    const filteredTodos = getFilteredTodos();

    // 필터된 목록이 비어있으면 empty state 표시
    if (filteredTodos.length === 0) {
        taskList.innerHTML = `
            <li class="empty-state">
                <p>아직 할 일이 없습니다.</p>
                <p class="empty-hint">위에서 새로운 할 일을 추가해보세요!</p>
            </li>
        `;
        updateProgress();
        return;
    }

    // 필터된 할 일 목록을 HTML로 생성
    taskList.innerHTML = filteredTodos.map(todo => `
        <li class="task-item ${todo.completed ? 'completed' : ''}">
            <input
                type="checkbox"
                class="task-checkbox"
                ${todo.completed ? 'checked' : ''}
                data-id="${todo.id}"
            >
            <div class="task-content">
                <span class="task-text">${escapeHtml(todo.text)}</span>
                <span class="task-category ${todo.category}">${getCategoryLabel(todo.category)}</span>
            </div>
            <div class="task-actions">
                <button class="delete-btn" data-id="${todo.id}" title="삭제">×</button>
            </div>
        </li>
    `).join('');

    // 진행률 업데이트
    updateProgress();

    // 이벤트 리스너 재등록 (새로 렌더링된 요소들에)
    attachEventListeners();
}

// XSS 방지: 사용자 입력 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// LocalStorage 저장
function saveTodos() {
    try {
        localStorage.setItem('todos', JSON.stringify(todos));
    } catch (e) {
        console.error('Failed to save todos to localStorage', e);
    }
}

// LocalStorage에서 복구
function loadTodos() {
    try {
        const saved = localStorage.getItem('todos');
        if (saved) {
            todos = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load todos from localStorage', e);
        todos = [];
    }
}

// 카테고리 라벨 변환
function getCategoryLabel(category) {
    const labels = {
        work: '업무',
        personal: '개인',
        study: '공부'
    };
    return labels[category] || category;
}

// 진행률 업데이트 함수
function updateProgress() {
    const filteredTodos = getFilteredTodos();
    const completedCount = filteredTodos.filter(todo => todo.completed).length;
    const totalCount = filteredTodos.length;
    const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('progressFill').style.width = percentage + '%';
    document.querySelector('.progress-percentage').textContent = percentage + '%';

    // 남은 할 일 개수 업데이트
    updateRemainingCount();

    // 완료된 항목 삭제 버튼 활성화/비활성화
    const hasCompleted = todos.some(todo => todo.completed);
    clearCompletedBtn.disabled = !hasCompleted;
}

// 필터 변경 함수
function setFilter(category) {
    currentFilter = category;

    // 탭의 active 클래스 업데이트
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    // 필터된 목록 렌더링
    renderTodos();
}

// 할 일 추가 함수
function addTodo(text, category) {
    // 입력값 검증
    const trimmedText = text.trim();
    if (!trimmedText) {
        alert('할 일 내용을 입력해주세요!');
        taskInput.focus();
        return false;
    }

    // 새 할 일 객체 생성
    const newTodo = {
        id: Date.now(), // 타임스탬프를 고유 id로 사용
        text: trimmedText,
        category: category,
        completed: false,
        createdAt: new Date().toISOString()
    };

    // 배열에 추가
    todos.push(newTodo);

    // LocalStorage 저장
    saveTodos();

    // DOM 업데이트
    renderTodos();

    // 입력 폼 초기화
    taskInput.value = '';
    taskInput.focus();

    return true;
}

// 할 일 삭제 함수
function deleteTodo(id) {
    // 배열에서 id와 일치하는 항목 제거
    todos = todos.filter(todo => todo.id !== id);

    // LocalStorage 저장
    saveTodos();

    // DOM 업데이트 (renderTodos에서 updateProgress 호출)
    renderTodos();
}

// 완료 상태 토글 함수
function toggleTodo(id) {
    // 해당 id의 할 일 찾기
    const todo = todos.find(t => t.id === id);
    if (todo) {
        // completed 상태 토글
        todo.completed = !todo.completed;

        // LocalStorage 저장
        saveTodos();

        // DOM 업데이트
        renderTodos();
    }
}

// 이벤트 리스너 등록 (체크박스, 삭제 버튼)
function attachEventListeners() {
    // 체크박스 이벤트
    const checkboxes = document.querySelectorAll('.task-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = parseInt(e.target.dataset.id);
            toggleTodo(id);
        });
    });

    // 삭제 버튼 이벤트
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const id = parseInt(e.target.dataset.id);
            if (confirm('이 할 일을 삭제하시겠습니까?')) {
                deleteTodo(id);
            }
        });
    });
}

// 폼 submit 이벤트 처리
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value;
    const category = categorySelect.value;
    addTodo(text, category);
});

// 단축키 처리 함수
function handleKeypress(e) {
    // Ctrl/Cmd + 1,2,3,4로 카테고리 필터 전환
    if ((e.ctrlKey || e.metaKey) && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const filterMap = {
            '1': 'all',
            '2': 'work',
            '3': 'personal',
            '4': 'study'
        };
        setFilter(filterMap[e.key]);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('✓ 추가 기능 포함: 다크모드, 검색, 단축키 등');

    // 테마 복구
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggleIcon();

    // LocalStorage에서 데이터 복구
    loadTodos();

    // 테마 토글 이벤트
    themToggle.addEventListener('click', toggleTheme);

    // 검색 입력 이벤트
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderTodos();
    });

    // 완료된 항목 삭제 버튼 이벤트
    clearCompletedBtn.addEventListener('click', clearCompleted);

    // 필터 탭 이벤트 리스너 등록
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.category);
        });
    });

    // 단축키 이벤트 리스너
    document.addEventListener('keydown', handleKeypress);

    // 초기 렌더링
    renderTodos();
});
