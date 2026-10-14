(function () {
  const core = window.TodoCore;
  const storage = window.localStorage;
  const store = core.createStore(storage);
  let currentFilter = 'all';
  const form = document.querySelector('#todo-form');
  const input = document.querySelector('#todo-input');
  const list = document.querySelector('#todo-list');
  const empty = document.querySelector('#empty-state');
  const count = document.querySelector('#task-count');
  const progress = document.querySelector('#progress-count');

  function render() {
    const allTodos = store.getAll();
    const visibleTodos = store.filter(currentFilter);
    list.replaceChildren(...visibleTodos.map(todo => {
      const item = document.createElement('li');
      item.className = `todo-item${todo.completed ? ' is-completed' : ''}`;
      item.dataset.id = todo.id;
      item.innerHTML = `<input type="checkbox" ${todo.completed ? 'checked' : ''} aria-label="完成任务：${escapeHtml(todo.text)}"><label>${escapeHtml(todo.text)}</label><button class="delete-button" type="button" aria-label="删除任务">×</button>`;
      return item;
    }));
    empty.hidden = visibleTodos.length !== 0;
    empty.textContent = allTodos.length && !visibleTodos.length ? '当前筛选下没有任务。' : '还没有任务，先添加一件要做的事吧。';
    count.textContent = `${allTodos.length} 项任务`;
    progress.textContent = `${allTodos.filter(todo => todo.completed).length} / ${allTodos.length}`;
  }

  function escapeHtml(value) { return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
  form.addEventListener('submit', event => { event.preventDefault(); if (store.add(input.value)) { input.value = ''; input.focus(); render(); } });
  list.addEventListener('change', event => { if (event.target.matches('input[type="checkbox"]')) { store.toggle(event.target.closest('.todo-item').dataset.id); render(); } });
  list.addEventListener('click', event => { if (event.target.matches('.delete-button')) { store.remove(event.target.closest('.todo-item').dataset.id); render(); } });
  document.querySelector('#filters').addEventListener('click', event => { const button = event.target.closest('[data-filter]'); if (!button) return; currentFilter = button.dataset.filter; document.querySelectorAll('.filter-button').forEach(item => item.classList.toggle('is-active', item === button)); render(); });
  render();
}());
