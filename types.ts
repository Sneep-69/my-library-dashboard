
export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  summary?: string;
  isRead: boolean;
  progress?: number;
  totalPages?: number;
  readPages?: number;
  addedAt: number;
}

export interface Stats {
  booksGoal: number;
  booksRead: number;
  streakDays: number;
  personalRecord: number;
}

export enum Tab {
  Home = 'Home',
  Library = 'Library',
  Stats = 'Stats',
  Config = 'Config'
}
