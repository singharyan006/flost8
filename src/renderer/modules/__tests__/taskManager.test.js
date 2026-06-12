const tm = require('../taskManager');

describe('taskManager', () => {
  test('createTask adds a task to state', () => {
    const state = { tasks: [] };
    const next = tm.createTask(state, 'Buy milk');
    expect(next.tasks.length).toBe(1);
    expect(next.tasks[0].text).toBe('Buy milk');
    expect(next.tasks[0].completed).toBe(false);
    expect(typeof next.tasks[0].id).toBe('string');
  });

  test('toggleTask toggles completed and completedAt', () => {
    const base = tm.createTask({ tasks: [] }, 'Do laundry');
    const id = base.tasks[0].id;
    const t1 = tm.toggleTask(base, id);
    expect(t1.tasks[0].completed).toBe(true);
    expect(t1.tasks[0].completedAt).not.toBeNull();

    const t2 = tm.toggleTask(t1, id);
    expect(t2.tasks[0].completed).toBe(false);
    expect(t2.tasks[0].completedAt).toBeNull();
  });

  test('updateTask updates fields', () => {
    const base = tm.createTask({ tasks: [] }, 'Old text');
    const id = base.tasks[0].id;
    const updated = tm.updateTask(base, id, { text: '  New text  ' });
    expect(updated.tasks[0].text).toBe('New text');
  });

  test('deleteTask removes task', () => {
    const base = tm.createTask({ tasks: [] }, 'TBD');
    const id = base.tasks[0].id;
    const after = tm.deleteTask(base, id);
    expect(after.tasks.length).toBe(0);
  });
});
