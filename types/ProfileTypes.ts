
export type Priority = 'high' | 'medium' | 'low';
export type ViewMode = 'list' | 'kanban';
export type SortOption = 'date' | 'priority' | 'dueDate';

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
    lastCompleted?: string;
}

export interface ProfileNote {
    id: string;
    note: string;
    section: string;
    priority: Priority;
    active: boolean;
    labels: string[];
    starred: boolean;
    createdAt: string;
}

export interface ProfileSection {
    id: string;
    name: string;
}

export interface Recurrence {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: string;
}