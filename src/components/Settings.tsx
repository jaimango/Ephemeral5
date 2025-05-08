import { useState, useEffect } from 'react';

interface SettingsProps {
  defaultTimeLimit: number;
  onTimeLimitChange: (hours: number) => void;
  showTimeRemaining: boolean;
  onTimeRemainingChange: (show: boolean) => void;
  showTimeCompleted: boolean;
  onTimeCompletedChange: (show: boolean) => void;
  showTimeExpired: boolean;
  onTimeExpiredChange: (show: boolean) => void;
}

interface ShareOptions {
  isOpen: boolean;
  includeActive: boolean;
  includeCompleted: boolean;
  includeExpired: boolean;
}

export const Settings = ({ 
  defaultTimeLimit, 
  onTimeLimitChange,
  showTimeRemaining,
  onTimeRemainingChange,
  showTimeCompleted,
  onTimeCompletedChange,
  showTimeExpired,
  onTimeExpiredChange
}: SettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLimit, setTimeLimit] = useState(defaultTimeLimit);
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    isOpen: false,
    includeActive: true,
    includeCompleted: false,
    includeExpired: false
  });

  useEffect(() => {
    setTimeLimit(defaultTimeLimit);
  }, [defaultTimeLimit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTimeLimitChange(timeLimit);
    setIsOpen(false);
  };

  const openShareDialog = () => {
    setShareOptions(prev => ({ ...prev, isOpen: true }));
  };

  const closeShareDialog = () => {
    setShareOptions(prev => ({ ...prev, isOpen: false }));
  };

  const formatTasksForSharing = (tasks: any[]) => {
    let result = "My Tasks\n\n";
    
    // Group tasks by their status
    const activeTasks = tasks.filter(t => !t.completed && new Date(t.expiresAt).getTime() > Date.now());
    const completedTasks = tasks.filter(t => t.completed);
    const expiredTasks = tasks.filter(t => !t.completed && new Date(t.expiresAt).getTime() <= Date.now());
    
    // Add active tasks
    if (shareOptions.includeActive && activeTasks.length > 0) {
      result += "ACTIVE TASKS:\n";
      activeTasks.forEach((task, index) => {
        const expiresAt = new Date(task.expiresAt);
        result += `${index + 1}. ${task.title} (Expires: ${expiresAt.toLocaleString()})\n`;
      });
      result += "\n";
    }
    
    // Add completed tasks
    if (shareOptions.includeCompleted && completedTasks.length > 0) {
      result += "COMPLETED TASKS:\n";
      completedTasks.forEach((task, index) => {
        const completedAt = task.completedAt ? new Date(task.completedAt) : null;
        result += `${index + 1}. ${task.title}${completedAt ? ` (Completed: ${completedAt.toLocaleString()})` : ''}\n`;
      });
      result += "\n";
    }
    
    // Add expired tasks
    if (shareOptions.includeExpired && expiredTasks.length > 0) {
      result += "EXPIRED TASKS:\n";
      expiredTasks.forEach((task, index) => {
        const expiredAt = new Date(task.expiresAt);
        result += `${index + 1}. ${task.title} (Expired: ${expiredAt.toLocaleString()})\n`;
      });
    }
    
    return result;
  };

  const handleShare = async () => {
    try {
      const todosJson = localStorage.getItem('todos');
      if (!todosJson) {
        alert('No tasks to share');
        return;
      }

      const todos = JSON.parse(todosJson);
      if (!todos.length) {
        alert('No tasks to share');
        return;
      }

      // Format tasks based on selected options
      const formattedTasks = formatTasksForSharing(todos);

      // Share the formatted tasks
      if (navigator.share) {
        await navigator.share({
          title: 'My Tasks',
          text: formattedTasks,
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        const dummy = document.createElement('textarea');
        document.body.appendChild(dummy);
        dummy.value = formattedTasks;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        alert('Task list copied to clipboard!');
      }
      
      closeShareDialog();
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share tasks');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors dark:hover:bg-gray-700"
        title="Settings"
      >
        <svg
          className="w-5 h-5 text-blue-500 dark:text-blue-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Time Limit (hours)
              </label>
              <input
                type="number"
                id="timeLimit"
                min="1"
                max="168"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Enter a value between 1 and 168 hours (1 week)
              </p>
            </div>
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showTimeRemaining}
                  onChange={(e) => onTimeRemainingChange(e.target.checked)}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show time remaining
                </span>
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showTimeCompleted}
                  onChange={(e) => onTimeCompletedChange(e.target.checked)}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show time completed
                </span>
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showTimeExpired}
                  onChange={(e) => onTimeExpiredChange(e.target.checked)}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show time expired
                </span>
              </label>
            </div>
            <div className="mb-4">
              <button
                type="button"
                onClick={openShareDialog}
                className="w-full px-4 py-2.5 text-sm text-blue-500 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 rounded-md flex items-center justify-center space-x-2 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                <span>Share Tasks</span>
              </button>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-blue-500 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 rounded-md transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {shareOptions.isOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-20 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 max-w-sm w-full border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Select tasks to share</h3>
            
            <div className="space-y-4 mb-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={shareOptions.includeActive}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, includeActive: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-5 h-5"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Include active tasks
                </span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={shareOptions.includeCompleted}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, includeCompleted: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-5 h-5"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Include completed tasks
                </span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={shareOptions.includeExpired}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, includeExpired: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 w-5 h-5"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Include expired tasks
                </span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeShareDialog}
                className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="px-4 py-2.5 text-sm text-blue-500 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 rounded-md transition-colors"
                disabled={!shareOptions.includeActive && !shareOptions.includeCompleted && !shareOptions.includeExpired}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 