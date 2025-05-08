export type TimeSection = 'Today' | 'This Week' | 'Last Week' | 'Last 30 Days' | 'Last Year' | 'All';

export const getTimeSection = (timestamp: number): TimeSection => {
  const now = Date.now();
  const today = new Date().setHours(0, 0, 0, 0);
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const oneMonth = 30 * 24 * 60 * 60 * 1000;
  const oneYear = 365 * 24 * 60 * 60 * 1000;

  const diff = now - timestamp;
  
  // Check if the timestamp is from today
  if (timestamp >= today) {
    return 'Today';
  } else if (diff <= oneWeek) {
    return 'This Week';
  } else if (diff <= oneWeek * 2) {
    return 'Last Week';
  } else if (diff <= oneMonth) {
    return 'Last 30 Days';
  } else if (diff <= oneYear) {
    return 'Last Year';
  } else {
    return 'All';
  }
};

export const groupTasksByTime = <T extends { completedAt?: number; expiresAt: number }>(
  tasks: T[],
  status: 'completed' | 'expired'
): Record<TimeSection, T[]> => {
  const sections: Record<TimeSection, T[]> = {
    'Today': [],
    'This Week': [],
    'Last Week': [],
    'Last 30 Days': [],
    'Last Year': [],
    'All': []
  };

  tasks.forEach(task => {
    const timestamp = status === 'completed' ? task.completedAt : task.expiresAt;
    if (timestamp) {
      const section = getTimeSection(timestamp);
      sections[section].push(task);
    }
  });

  return sections;
}; 