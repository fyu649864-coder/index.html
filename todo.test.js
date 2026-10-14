const test = require('node:test');
const assert = require('node:assert/strict');
const { createStore, STORAGE_KEY } = require('./todo.js');

function fakeStorage(initial = []) {
  const data = new Map([[STORAGE_KEY, JSON.stringify(initial)]]);
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), raw: () => JSON.parse(data.get(STORAGE_KEY)) };
}

test('adds trimmed tasks and persists them', () => {
  const storage = fakeStorage();
  const store = createStore(storage);
  const task = store.add('  复习英语  ');
  assert.equal(task.text, '复习英语');
  assert.equal(store.getAll().length, 1);
  assert.equal(storage.raw()[0].text, '复习英语');
});

test('ignores blank tasks', () => {
  const store = createStore(fakeStorage());
  assert.equal(store.add('   '), null);
  assert.deepEqual(store.getAll(), []);
});

test('toggles and removes a task', () => {
  const storage = fakeStorage();
  const store = createStore(storage);
  const task = store.add('完成作业');
  store.toggle(task.id);
  assert.equal(store.getAll()[0].completed, true);
  store.remove(task.id);
  assert.deepEqual(store.getAll(), []);
  assert.deepEqual(storage.raw(), []);
});

test('filters all, active, and completed tasks', () => {
  const store = createStore(fakeStorage());
  const active = store.add('进行中的任务');
  const completed = store.add('已完成的任务');
  store.toggle(completed.id);
  assert.equal(store.filter('all').length, 2);
  assert.deepEqual(store.filter('active').map(item => item.id), [active.id]);
  assert.deepEqual(store.filter('completed').map(item => item.id), [completed.id]);
});

test('restores valid saved tasks and ignores malformed storage', () => {
  const saved = [{ id: '1', text: '保留', completed: false }];
  assert.equal(createStore(fakeStorage(saved)).getAll()[0].text, '保留');
  const brokenStorage = { getItem: () => '{not-json}', setItem() {} };
  assert.deepEqual(createStore(brokenStorage).getAll(), []);
});
