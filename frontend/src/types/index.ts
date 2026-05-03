export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner: User;
  member_count: number;
  task_count: number;
  created_at: string;
}

export interface ProjectDetail extends Project {
  members: User[];
  task_summary: {
    todo: number;
    in_progress: number;
    done: number;
  };
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  project_id: string;
  created_by: User;
  assigned_to: User | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  total_projects: number;
  total_tasks: number;
  total_members: number;
  tasks_by_status: {
    todo: number;
    in_progress: number;
    done: number;
  };
  overdue_tasks: {
    id: string;
    title: string;
    due_date: string;
    project_name: string;
    assigned_to_name: string;
  }[];
  recent_tasks: {
    id: string;
    title: string;
    project_name: string;
    status: TaskStatus;
    priority: TaskPriority;
    updated_at: string;
  }[];
}
