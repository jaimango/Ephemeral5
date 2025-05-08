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

  useEffect(() => {
    setTimeLimit(defaultTimeLimit);
  }, [defaultTimeLimit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTimeLimitChange(timeLimit);
    setIsOpen(false);
  };

  const handleShare = async () => {
    try {
      const todos = localStorage.getItem('todos');
      if (!todos) {
        alert('No tasks to share');
        return;
      }

      const shareData = {
        title: 'My Tasks',
        text: 'Check out my tasks!',
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support the Web Share API
        const dummy = document.createElement('input');
        document.body.appendChild(dummy);
        dummy.value = window.location.href;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share tasks');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
        title="Settings"
      >
        <svg
          className="w-4 h-4 text-gray-500"
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
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10">
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
                onClick={handleShare}
                className="w-full px-4 py-2 text-sm text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 rounded-md flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
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
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 rounded-md"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}; 