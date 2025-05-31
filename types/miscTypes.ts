
export interface AuthIdentity {
  id: string;
  role?: string;
}

export interface ProfileSection {
  id: string;
  name: string;
}

export interface ProfileNote {
  id: number;
  note: string;
  section: string;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  starred?: boolean;
}

export interface ProfileData {
  id: string;
  avatar?: string;
  fullname: string;
  username: string;
  email: string;
  phone: string;
  streetaddress: string;
  city: string;
  country: string;
  zip: string;
  role: string;
  tasks?: ProfileTask[];
  notes?: ProfileNote[];
  // Custom (personalized) sections stored on the profile.
  // Note: Default sections ("all", "active", "archived") are managed in the UI.
  sections?: ProfileSection[];
}

export interface Blog {
  id: string;
  profile_id: string;
  title: string;
  content: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  image_link?: string;
}


// types/task.ts

// Priority type
export type Priority = 'low' | 'medium' | 'high';

// Task label type
export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}
// Add to your types file (or at the top of this component)
export type Recurrence = {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[]; // For weekly (0-6, Sunday-Saturday)
  dayOfMonth?: number;   // For monthly
  endDate?: string;      // Optional end date for recurrence
};

// Profile section type (for kanban columns/categories)
export interface ProfileSection {
  id: string;
  name: string;
  icon?: React.ReactNode;
  order?: number;
}

// Main task type
export interface ProfileTask {
  id: string;
  task: string;
  section: string;
  completed: boolean;
  priority: Priority;
  active: boolean;
  dueDate: string | null;
  labels: string[];
  starred: boolean;
  createdAt: string;
  recurrence?: Recurrence;
  lastCompleted?: string; // Track when it was last completed for recurrence
}


// Filter options type
export interface TaskFilterOptions {
  section?: string;
  priority?: Priority | 'all';
  dueDate?: 'today' | 'overdue' | 'upcoming' | 'all';
  searchQuery?: string;
  showCompleted?: boolean;
  labels?: string[]; // array of label IDs
}

// Sort options type
export type SortOption = 'date' | 'priority' | 'manual' | 'dueDate';

// View mode type
export type ViewMode = 'list' | 'kanban' | 'calendar';