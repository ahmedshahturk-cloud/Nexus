import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Settings,
  Users,
  FolderKanban
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import api from '../../lib/axios';
import type { ProjectDetail, Task, TaskPriority, TaskStatus, User } from '@/types';
import { format } from 'date-fns';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [memberId, setMemberId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          api.get(`/api/v1/projects/${id}`),
          api.get(`/api/v1/projects/${id}/tasks`)
        ]);
        setProject(projRes.data);
        setTasks(tasksRes.data);
        const usersRes = await api.get('/api/v1/users/');
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Failed to fetch project details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const refreshProject = async () => {
    const response = await api.get(`/api/v1/projects/${id}`);
    setProject(response.data);
  };

  const handleCreateTask = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = taskTitle.trim();

    if (!title) {
      toast.error('Task title is required');
      return;
    }

    try {
      const response = await api.post(`/api/v1/projects/${id}/tasks`, {
        title,
        description: taskDescription.trim() || null,
        priority: taskPriority,
        due_date: taskDueDate || null,
        assigned_to: taskAssignee || null,
      });
      setTasks((current) => [response.data, ...current]);
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('medium');
      setTaskDueDate('');
      setTaskAssignee('');
      setIsTaskOpen(false);
      toast.success('Task created');
    } catch (error) {
      const detail = error instanceof AxiosError ? error.response?.data?.detail : null;
      toast.error(detail || 'Failed to create task');
    }
  };

  const handleAddMember = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!memberId) {
      toast.error('Choose a member');
      return;
    }

    try {
      await api.post(`/api/v1/projects/${id}/members`, { user_id: memberId });
      setMemberId('');
      setIsMemberOpen(false);
      await refreshProject();
      toast.success('Member added');
    } catch (error) {
      const detail = error instanceof AxiosError ? error.response?.data?.detail : null;
      toast.error(detail || 'Failed to add member');
    }
  };

  if (loading || !project) {
    return <div className="p-10 skeleton h-96 rounded-3xl" />;
  }

  const columns: { title: string; status: TaskStatus; icon: LucideIcon; color: string }[] = [
    { title: 'To Do', status: 'todo', icon: AlertCircle, color: 'text-text-secondary' },
    { title: 'In Progress', status: 'in_progress', icon: Clock, color: 'text-primary' },
    { title: 'Completed', status: 'done', icon: CheckCircle2, color: 'text-accent' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4">
          <Link to="/projects" className="flex items-center text-sm text-text-secondary hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Projects
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary">
              <FolderKanban className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-text-primary tracking-tight">{project.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center text-sm text-text-secondary">
                  <Users className="w-4 h-4 mr-1.5" />
                  {project.members.length} Members
                </div>
                <div className="w-1 h-1 rounded-full bg-dark-border" />
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="bg-dark-card border-dark-border rounded-xl"
            onClick={() => setIsMemberOpen(true)}
          >
            <Users className="w-4 h-4 mr-2" />
            Team
          </Button>
          <Button variant="outline" className="bg-dark-card border-dark-border rounded-xl">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20"
            onClick={() => setIsTaskOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {isTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <form onSubmit={handleCreateTask} className="w-full max-w-lg space-y-5 rounded-xl border border-white/10 bg-dark-card p-6 shadow-2xl shadow-primary/20">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Add Task</h2>
              <p className="mt-1 text-sm text-text-secondary">Create work and assign it to a project member.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-title" className="text-text-primary">Title</Label>
              <Input id="task-title" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} className="h-11 bg-dark border-dark-border text-white" autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description" className="text-text-primary">Description</Label>
              <textarea id="task-description" value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} className="min-h-24 w-full resize-none rounded-lg border border-dark-border bg-dark px-3 py-2 text-sm text-white outline-none focus-visible:ring-3 focus-visible:ring-primary/50" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="task-priority" className="text-text-primary">Priority</Label>
                <select id="task-priority" value={taskPriority} onChange={(event) => setTaskPriority(event.target.value as TaskPriority)} className="h-11 w-full rounded-lg border border-dark-border bg-dark px-3 text-sm text-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-date" className="text-text-primary">Due date</Label>
                <Input id="task-date" type="date" value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} className="h-11 bg-dark border-dark-border text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-assignee" className="text-text-primary">Assign to</Label>
                <select id="task-assignee" value={taskAssignee} onChange={(event) => setTaskAssignee(event.target.value)} className="h-11 w-full rounded-lg border border-dark-border bg-dark px-3 text-sm text-white">
                  <option value="">Unassigned</option>
                  {project.members.map((member) => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" className="border-dark-border bg-dark" onClick={() => setIsTaskOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary text-white">Create Task</Button>
            </div>
          </form>
        </div>
      )}

      {isMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <form onSubmit={handleAddMember} className="w-full max-w-md space-y-5 rounded-xl border border-white/10 bg-dark-card p-6 shadow-2xl shadow-primary/20">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Add Member</h2>
              <p className="mt-1 text-sm text-text-secondary">Add an employee before assigning tasks.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="member" className="text-text-primary">Member</Label>
              <select id="member" value={memberId} onChange={(event) => setMemberId(event.target.value)} className="h-11 w-full rounded-lg border border-dark-border bg-dark px-3 text-sm text-white">
                <option value="">Choose user</option>
                {users
                  .filter((user) => user.role === 'member' && !project.members.some((member) => member.id === user.id))
                  .map((user) => (
                    <option key={user.id} value={user.id}>{user.name} - {user.email}</option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" className="border-dark-border bg-dark" onClick={() => setIsMemberOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary text-white">Add Member</Button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => (
          <Card key={col.status} className="bg-dark-card/50 border-dark-border backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-dark ${col.color}`}>
                  <col.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-text-secondary">{col.title}</span>
              </div>
              <span className="text-xl font-bold text-text-primary">
                {tasks.filter(t => t.status === col.status).length}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {columns.map((column) => (
          <div key={column.status} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-text-primary uppercase tracking-wider text-sm">{column.title}</h3>
                <Badge variant="secondary" className="bg-dark-border text-text-secondary rounded-full px-2 py-0">
                  {tasks.filter(t => t.status === column.status).length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4 min-h-[500px] p-2 rounded-2xl bg-dark/20 border border-dashed border-dark-border">
              <AnimatePresence>
                {tasks.filter(t => t.status === column.status).map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -4 }}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <Card className="bg-dark-card border-dark-border shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <Badge className={`
                            ${task.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                              task.priority === 'medium' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                              'bg-green-500/10 text-green-500 border-green-500/20'} 
                            text-[10px] font-bold uppercase
                          `}>
                            {task.priority}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-text-secondary">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <h4 className="font-semibold text-text-primary leading-tight">{task.title}</h4>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center text-xs text-text-secondary">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            {task.due_date ? format(new Date(task.due_date), 'MMM d') : 'No date'}
                          </div>
                          
                          <div className="flex -space-x-2">
                            {task.assigned_to ? (
                              <div className="w-7 h-7 rounded-full bg-primary/20 border-2 border-dark-card flex items-center justify-center text-[10px] font-bold text-primary" title={task.assigned_to.name}>
                                {task.assigned_to.name.charAt(0)}
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-dark-border border-2 border-dark-card flex items-center justify-center text-text-secondary">
                                <Users className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetails;
