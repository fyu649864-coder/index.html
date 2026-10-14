(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TodoCore = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const STORAGE_KEY = 'student-todos-v1';

  function createId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function readTodos(storage) {
    try {
      const value = JSON.parse(storage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(value) ? value.filter(todo => todo && typeof todo.text === 'string') : [];
    } catch (_) {
      return [];
    }
  }

  function saveTodos(storage, todos) {
    storage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function createStore(storage) {
    let todos = readTodos(storage);

    const persist = () => saveTodos(storage, todos);
    return {
      getAll: () => [...todos],
      add(text) {
        const cleanText = String(text).trim();
        if (!cleanText) return null;
        const todo = { id: createId(), text: cleanText, completed: false, createdAt: Date.now() };
        todos = [todo, ...todos];
        persist();
        return todo;
      },
      toggle(id) {
        todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
        persist();
      },
      remove(id) {
        todos = todos.filter(todo => todo.id !== id);
        persist();
      },
      filter(status) {
        if (status === 'active') return todos.filter(todo => !todo.completed);
        if (status === 'completed') return todos.filter(todo => todo.completed);
        return [...todos];
      }
    };
  }

  return { STORAGE_KEY, createStore, readTodos, saveTodos };
}));
