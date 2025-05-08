export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  expiresAt: number;
  completedAt?: number;
  isRecurring: boolean;
  repeatInterval?: number; // in milliseconds
  order?: number; // for drag-and-drop reordering
}

export type TodoStatus = 'active' | 'completed' | 'expired'; 