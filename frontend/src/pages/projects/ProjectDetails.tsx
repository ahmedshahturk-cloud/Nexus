import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Filter, 
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
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import api from '../../lib/axios';
import { ProjectDetail, Task, TaskStatus } from '../../types';
import { format } from 'date-fns';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          api.get(`/api/v1/projects/${id}`),
          api.get(`/api/v1/projects/${id}/tasks`)
        ]);
        setProject(projRes.data);
        setTasks(tasksRes.data);
      } catch (error) {
        console.error('Failed to fetch project details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await api.put(`/api/v1/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  if (loading || !project) {
    return <div className="p-10 skeleton h-96 rounded-3xl" />;
  }

  const columns: { title: string; status: TaskStatus; icon: any; color: string }[] = [
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
          <Button variant="outline" className="bg-dark-card border-dark-border rounded-xl">
            <Users className="w-4 h-4 mr-2" />
            Team
          </Button>
          <Button variant="outline" className="bg-dark-card border-dark-border rounded-xl">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

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
