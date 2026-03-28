import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export const TodoList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('brutalist-tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse tasks', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('brutalist-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (inputValue.trim()) {
      const newTask: Task = {
        id: Math.random().toString(36).substring(2, 11),
        text: inputValue.trim(),
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setInputValue('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="brutalist-card">
      <h2 className="text-xl font-bold mb-4 uppercase tracking-tighter">Tasks</h2>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="New task..."
          className="brutalist-input font-mono text-sm"
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <button onClick={addTask} className="brutalist-button p-2">
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="text-center py-4 border-2 border-dashed border-muted font-mono text-xs uppercase text-muted-foreground">
            No tasks yet.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-2 p-2 border-2 border-black ${task.completed ? 'bg-secondary' : 'bg-white'}`}
            >
              <button onClick={() => toggleTask(task.id)} className="text-primary">
                {task.completed ? <CheckSquare size={18} /> : <Square size={18} />}
              </button>
              <span className={`flex-1 font-mono text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.text}
              </span>
              <button onClick={() => removeTask(task.id)} className="text-destructive hover:text-red-700">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
