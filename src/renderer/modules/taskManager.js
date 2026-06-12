// Pure task manager utilities — stateless, return new state objects
function generateId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (e) {
    // ignore
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function createTask(state = {}, text) {
  if (typeof text !== 'string') throw new Error('text must be a string');
  const trimmed = text.trim();
  if (!trimmed) throw new Error('text is required');

  const task = {
    id: generateId(),
    text: trimmed,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null
  };

  const tasks = [task].concat(Array.isArray(state.tasks) ? state.tasks : []);

  return Object.assign({}, state, { tasks });
}

function toggleTask(state = {}, id) {
  if (!Array.isArray(state.tasks)) return state;
  const tasks = state.tasks.map(t => {
    if (t.id !== id) return t;
    const completed = !t.completed;
    return Object.assign({}, t, {
      completed,
      completedAt: completed ? new Date().toISOString() : null
    });
  });
  return Object.assign({}, state, { tasks });
}

function updateTask(state = {}, id, attrs = {}) {
  if (!Array.isArray(state.tasks)) return state;
  const tasks = state.tasks.map(t => {
    if (t.id !== id) return t;
    const updated = Object.assign({}, t, attrs);
    if (typeof updated.text === 'string') updated.text = updated.text.trim();
    return updated;
  });
  return Object.assign({}, state, { tasks });
}

function deleteTask(state = {}, id) {
  if (!Array.isArray(state.tasks)) return state;
  const tasks = state.tasks.filter(t => t.id !== id);
  return Object.assign({}, state, { tasks });
}

function listTasks(state = {}, filter = {}) {
  const tasks = Array.isArray(state.tasks) ? state.tasks.slice() : [];
  if (filter.completed === true) return tasks.filter(t => t.completed);
  if (filter.completed === false) return tasks.filter(t => !t.completed);
  return tasks;
}

module.exports = {
  generateId,
  createTask,
  toggleTask,
  updateTask,
  deleteTask,
  listTasks
};
