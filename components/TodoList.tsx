import React, { useState, useEffect, useRef } from 'react';
import { Todo, User } from '../types';
import { TodoItem } from './TodoItem';
import { Button } from './Button';
import { breakdownTask } from '../services/geminiService';

interface TodoListProps {
  user: User;
  onLogout: () => void;
}

export const TodoList: React.FC<TodoListProps> = ({ user, onLogout }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load todos from local storage
    const saved = localStorage.getItem(`todos_${user.id}`);
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  }, [user.id]);

  useEffect(() => {
    // Save todos to local storage
    localStorage.setItem(`todos_${user.id}`, JSON.stringify(todos));
  }, [todos, user.id]);

  const addTodo = (text: string, isAi = false) => {
    if (!text.trim()) return;
    const newTodo: Todo = {
      id: Date.now().toString() + Math.random().toString(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
      isAiGenerated: isAi
    };
    setTodos(prev => [...prev, newTodo]);
    // Scroll to bottom after adding
    setTimeout(() => scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleAdd = () => {
    addTodo(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  // Feature: AI Breakdown
  const handleAiBreakdown = async () => {
    if (!inputValue.trim()) return;
    
    setIsAiLoading(true);
    // Add the main task first
    addTodo(inputValue);
    const originalTask = inputValue;
    setInputValue(''); // Clear input immediately

    // Get suggestions
    const subtasks = await breakdownTask(originalTask);
    
    subtasks.forEach(task => {
      addTodo(task, true);
    });
    
    setIsAiLoading(false);
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="max-w-3xl mx-auto min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">My Tasks</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0)}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
          </div>
          <button 
            onClick={onLogout} 
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Progress */}
      <div className="px-6 py-6">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.name.split(' ')[0]}!
          </h2>
          <span className="text-sm font-medium text-gray-500">
            {completedCount}/{todos.length} done
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${todos.length > 0 ? (completedCount / todos.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* List */}
      <main className="flex-1 px-6 pb-32">
        {todos.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-lg text-gray-500">No tasks yet. Start by adding one!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {todos.map(todo => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                onToggle={toggleTodo} 
                onDelete={deleteTodo} 
              />
            ))}
            <div ref={scrollEndRef} />
          </div>
        )}
      </main>

      {/* Sticky Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg-up">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a new task..."
              className="w-full pl-4 pr-10 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500"
            />
          </div>
          
          {/* AI Button - Visible if text exists */}
          {inputValue.trim().length > 3 && (
            <Button 
              variant="secondary" 
              onClick={handleAiBreakdown}
              disabled={isAiLoading}
              title="Use AI to break this task into smaller steps"
              className="hidden sm:flex"
            >
              {isAiLoading ? (
                 <span>Thinking...</span>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  Break Down
                </>
              )}
            </Button>
          )}

          <Button 
            onClick={handleAdd}
            disabled={!inputValue.trim() || isAiLoading}
            className="w-12 h-12 rounded-xl !p-0 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};
