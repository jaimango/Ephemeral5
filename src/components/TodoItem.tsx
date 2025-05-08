import { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onReset: (id: string) => void;
  onReadd: (id: string) => void;
  onToggleRepeat: (id: string) => void;
  status: 'active' | 'completed' | 'expired';
  index: number;
  showTimeRemaining: boolean;
  showTimeCompleted: boolean;
  showTimeExpired: boolean;
}

export const TodoItem = ({ 
  todo, 
  onComplete, 
  onDelete, 
  onReset, 
  onReadd, 
  onToggleRepeat,
  status,
  index,
  showTimeRemaining,
  showTimeCompleted,
  showTimeExpired
}: TodoItemProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTimeRemaining = () => {
    if (status !== 'active' || todo.completed) return null;
    
    const now = Date.now();
    const timeLeft = todo.expiresAt - now;
    
    if (timeLeft <= 0) return null;

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const handleComplete = () => {
    setIsCompleting(true);
    
    // Delay the actual completion to allow for animation
    setTimeout(() => {
      onComplete(todo.id);
    }, 750); // Slightly less than the animation duration
  };

  const content = (
    <div className={`flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow mb-2 transition-all ${isCompleting ? 'task-fade-out' : ''}`}>
      <div className="flex items-center space-x-3 flex-1">
        {status === 'active' && (
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="p-1 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-gray-400 hover:text-blue-500 group"
            title="Mark as completed"
          >
            <svg 
              className="w-5 h-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <path d="M9 12l2 2 4-4" className="opacity-0 group-hover:opacity-100" />
            </svg>
          </button>
        )}
        <div className="flex-1">
          <div>
            <span className={`${todo.completed ? 'line-through text-gray-500' : ''}`}>
              {todo.title}
            </span>
            {todo.isRecurring && (
              <span className="ml-2 inline-block" title="Recurring task">
                <svg 
                  className="w-4 h-4 text-blue-500 inline" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </span>
            )}
            {status === 'active' && !todo.completed && showTimeRemaining && (
              <span className="ml-2 text-sm text-blue-500 font-medium">
                {formatTimeRemaining()}
              </span>
            )}
          </div>
          {(status === 'completed' && todo.completedAt && showTimeCompleted) && (
            <div className="text-sm text-gray-500 mt-1">
              Completed: {formatDate(todo.completedAt)}
            </div>
          )}
          {(status === 'expired' && showTimeExpired) && (
            <div className="text-sm text-gray-500 mt-1">
              Expired: {formatDate(todo.expiresAt)}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-2">
        {status === 'active' && !isCompleting && (
          <>
            <button
              onClick={() => onToggleRepeat(todo.id)}
              className={`p-2 hover:bg-blue-50 rounded-full transition-colors ${todo.isRecurring ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
              title={todo.isRecurring ? "Stop repeating task" : "Make task repeat daily"}
            >
              <svg 
                className="w-5 h-5 sm:w-5 sm:h-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
            <button
              onClick={() => onReset(todo.id)}
              className="p-2 hover:bg-blue-50 rounded-full text-gray-400 hover:text-blue-400 transition-colors"
              aria-label="Reset timer"
              title="Reset 24-hour timer"
            >
              <svg 
                className="w-5 h-5 sm:w-5 sm:h-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M23 4v6h-6" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
          </>
        )}
        {status === 'completed' && (
          <button
            onClick={() => onReadd(todo.id)}
            className="p-2 hover:bg-blue-50 rounded-full text-gray-400 hover:text-blue-400 transition-colors"
            title="Restore task"
          >
            <svg 
              className="w-5 h-5 sm:w-5 sm:h-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        )}
        {status === 'expired' && (
          <button
            onClick={() => onReadd(todo.id)}
            className="p-2 hover:bg-blue-50 rounded-full text-gray-400 hover:text-blue-400 transition-colors"
            title="Re-add to active tasks"
          >
            <svg 
              className="w-5 h-5 sm:w-5 sm:h-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        )}
        {!isCompleting && (
          <button
            onClick={() => onDelete(todo.id)}
            className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Delete task"
            title="Delete task"
          >
            <svg 
              className="w-5 h-5 sm:w-5 sm:h-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>
      
      {(status === 'completed' || status === 'expired') && (
        <div className="text-sm text-gray-500 ml-4">
        </div>
      )}
    </div>
  );

  if (status === 'active' && !isCompleting) {
    return (
      <Draggable draggableId={todo.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${snapshot.isDragging ? 'shadow-lg' : ''}`}
          >
            {content}
          </div>
        )}
      </Draggable>
    );
  }

  return content;
}; 