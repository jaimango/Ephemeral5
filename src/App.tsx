import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Todo, TodoStatus } from './types/todo';
import { TodoItem } from './components/TodoItem';
import { Settings } from './components/Settings';
import { groupTasksByTime, TimeSection } from './utils/timeUtils';

const STORAGE_KEY = 'todos';
const SETTINGS_KEY = 'todoSettings';

interface TodoSettings {
  defaultTimeLimit: number;
  showTimeRemaining: boolean;
  showTimeCompleted: boolean;
  showTimeExpired: boolean;
}

const DEFAULT_SETTINGS: TodoSettings = {
  defaultTimeLimit: 24,
  showTimeRemaining: true,
  showTimeCompleted: true,
  showTimeExpired: true,
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const savedTodos = localStorage.getItem(STORAGE_KEY);
      return savedTodos ? JSON.parse(savedTodos) : [];
    } catch (error) {
      console.error('Error loading todos from localStorage:', error);
      return [];
    }
  });

  const [settings, setSettings] = useState<TodoSettings>(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      return DEFAULT_SETTINGS;
    }
  });

  const [newTodo, setNewTodo] = useState('');
  const [activeTab, setActiveTab] = useState<TodoStatus>('active');

  // Save todos to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos to localStorage:', error);
    }
  }, [todos]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, [settings]);

  // Handle recurring tasks
  useEffect(() => {
    const now = Date.now();
    const recurringTodos = todos.filter(todo => 
      todo.isRecurring && 
      todo.completed && 
      todo.completedAt && 
      now - todo.completedAt >= ONE_DAY_MS
    );

    if (recurringTodos.length > 0) {
      setTodos(prev => prev.map(todo => {
        if (recurringTodos.some(rt => rt.id === todo.id)) {
          return {
            ...todo,
            completed: false,
            completedAt: undefined,
            expiresAt: now + settings.defaultTimeLimit * 60 * 60 * 1000
          };
        }
        return todo;
      }));
    }
  }, [todos, settings.defaultTimeLimit]);

  const addTodo = (title: string) => {
    if (!title.trim()) return;
    
    const now = Date.now();
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      createdAt: now,
      expiresAt: now + settings.defaultTimeLimit * 60 * 60 * 1000,
      isRecurring: false,
    };
    
    setTodos(prev => [...prev, newTodo]);
    setNewTodo('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo(newTodo);
    }
  };

  const completeTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id 
        ? { ...todo, completed: true, completedAt: Date.now() }
        : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const resetTodo = (id: string) => {
    const now = Date.now();
    setTodos(prev => prev.map(todo =>
      todo.id === id
        ? { ...todo, expiresAt: now + settings.defaultTimeLimit * 60 * 60 * 1000 }
        : todo
    ));
  };

  const readdTodo = (id: string) => {
    const now = Date.now();
    setTodos(prev => prev.map(todo =>
      todo.id === id
        ? { 
            ...todo, 
            completed: false, 
            completedAt: undefined,
            expiresAt: now + settings.defaultTimeLimit * 60 * 60 * 1000 
          }
        : todo
    ));
  };

  const toggleRepeat = (id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id
        ? { ...todo, isRecurring: !todo.isRecurring }
        : todo
    ));
  };

  const handleTimeLimitChange = (hours: number) => {
    setSettings(prev => ({ ...prev, defaultTimeLimit: hours }));
  };

  const handleTimeRemainingChange = (show: boolean) => {
    setSettings(prev => ({ ...prev, showTimeRemaining: show }));
  };

  const handleTimeCompletedChange = (show: boolean) => {
    setSettings(prev => ({ ...prev, showTimeCompleted: show }));
  };

  const handleTimeExpiredChange = (show: boolean) => {
    setSettings(prev => ({ ...prev, showTimeExpired: show }));
  };

  const filteredTodos = todos.filter(todo => {
    const now = Date.now();
    if (activeTab === 'active') {
      return !todo.completed && todo.expiresAt > now;
    }
    if (activeTab === 'completed') {
      return todo.completed;
    }
    if (activeTab === 'expired') {
      return !todo.completed && todo.expiresAt <= now;
    }
    return false;
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(filteredTodos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order in the todos array
    const newTodos = todos.map(todo => {
      const index = items.findIndex(item => item.id === todo.id);
      if (index !== -1) {
        return { ...todo, order: index };
      }
      return todo;
    });

    setTodos(newTodos);
  };

  const renderTimeSection = (section: TimeSection, tasks: Todo[]) => {
    if (tasks.length === 0) return null;
    
    return (
      <div key={section} className="mb-3 w-full">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">{section}</h2>
        <div className="space-y-1 w-full">
          {tasks.map((todo, index) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onComplete={completeTodo}
              onDelete={deleteTodo}
              onReset={resetTodo}
              onReadd={readdTodo}
              onToggleRepeat={toggleRepeat}
              status={activeTab}
              index={index}
              showTimeRemaining={settings.showTimeRemaining}
              showTimeCompleted={settings.showTimeCompleted}
              showTimeExpired={settings.showTimeExpired}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderTasks = () => {
    if (activeTab === 'active') {
      return (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="active-tasks">
            {(provided) => (
              <div
                className="w-full"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <div className="space-y-1 w-full">
                  {filteredTodos.map((todo, index) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onComplete={completeTodo}
                      onDelete={deleteTodo}
                      onReset={resetTodo}
                      onReadd={readdTodo}
                      onToggleRepeat={toggleRepeat}
                      status={activeTab}
                      index={index}
                      showTimeRemaining={settings.showTimeRemaining}
                      showTimeCompleted={settings.showTimeCompleted}
                      showTimeExpired={settings.showTimeExpired}
                    />
                  ))}
                  {provided.placeholder}
                  {filteredTodos.length === 0 && (
                    <div className="text-center text-gray-500 py-4 w-full">
                      No active tasks
                    </div>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      );
    }

    const groupedTasks = groupTasksByTime(filteredTodos, activeTab);
    const sections: TimeSection[] = ['Today', 'This Week', 'Last Week', 'Last 30 Days', 'Last Year', 'All'];

    return (
      <div className="w-full">
        {sections.map(section => renderTimeSection(section, groupedTasks[section]))}
        {filteredTodos.length === 0 && (
          <div className="text-center text-gray-500 py-4 w-full">
            No {activeTab} tasks
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-3 lg:px-4">
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[26px] font-normal text-gray-500 dark:text-gray-400">Ephemeral Notes</span>
          <Settings
            defaultTimeLimit={settings.defaultTimeLimit}
            onTimeLimitChange={handleTimeLimitChange}
            showTimeRemaining={settings.showTimeRemaining}
            onTimeRemainingChange={handleTimeRemainingChange}
            showTimeCompleted={settings.showTimeCompleted}
            onTimeCompletedChange={handleTimeCompletedChange}
            showTimeExpired={settings.showTimeExpired}
            onTimeExpiredChange={handleTimeExpiredChange}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-3 mb-4 w-full">
          <div className="w-full grid grid-cols-3 gap-4 mb-3">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-2 text-base rounded w-full ${
                activeTab === 'active' 
                  ? 'bg-blue-500 text-blue-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-2 text-base rounded w-full ${
                activeTab === 'completed' 
                  ? 'bg-blue-500 text-blue-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab('expired')}
              className={`px-6 py-2 text-base rounded w-full ${
                activeTab === 'expired' 
                  ? 'bg-blue-500 text-blue-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expired
            </button>
          </div>

          {activeTab === 'active' ? (
            <div className="flex space-x-2 w-full">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => addTodo(newTodo)}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                +
              </button>
            </div>
          ) : (
            <div className="h-[42px]"></div> // Height placeholder to maintain consistent layout
          )}
        </div>

        <div className="w-full">
          {renderTasks()}
        </div>
      </div>
    </div>
  );
}

export default App;
