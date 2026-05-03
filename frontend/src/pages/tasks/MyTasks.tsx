import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import api from '../../lib/axios';
import type { Task, TaskStatus } from '@/types';
import { toast } from 'react-hot-toast';

const statuses: { label: string; value: TaskStatus; icon: typeof AlertCircle }[] = [
  { label: 'Todo', value: 'todo', icon: AlertCircle },
  { label: 'In Progress', value: 'in_progress', icon: Clock },
  { label: 'Done', value: 'done', icon: CheckCircle2 },
];

const MyTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/api/v1/tasks/my');
        setTasks(response.data);
      } catch {
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const updateStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const response = await api.put(`/api/v1/tasks/${taskId}`, { status });
      setTasks((current) => current.map((task) => (task.id === taskId ? response.data : task)));
      toast.success('Task updated');
    } catch {
      toast.error('Could not update task');
    }
  };

  if (loading) {
    return <div className="h-80 rounded-xl skeleton" />;
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">My Tasks</h1>
        <p className="mt-1 text-text-secondary">Your assigned work. Update only the status as you progress.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {statuses.map((column) => {
          const Icon = column.icon;
          const columnTasks = tasks.filter((task) => task.status === column.value);

          return (
            <div key={column.value} className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">{column.label}</h2>
                </div>
                <Badge variant="secondary" className="bg-dark-border text-text-secondary">{columnTasks.length}</Badge>
              </div>

              <div className="min-h-[420px] space-y-4 rounded-xl border border-dashed border-dark-border bg-dark/30 p-3">
                {columnTasks.map((task) => (
                  <Card key={task.id} className="border-dark-border bg-dark-card">
                    <CardContent className="space-y-4 p-4">
                      <Badge className="bg-primary/10 text-primary">{task.priority}</Badge>
                      <div>
                        <h3 className="font-semibold text-text-primary">{task.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{task.description || 'No description'}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {statuses.map((status) => (
                          <Button
                            key={status.value}
                            size="sm"
                            variant={status.value === task.status ? 'default' : 'outline'}
                            className={status.value === task.status ? 'bg-primary text-white' : 'border-dark-border bg-dark'}
                            onClick={() => updateStatus(task.id, status.value)}
                          >
                            {status.label}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {columnTasks.length === 0 && (
                  <div className="py-10 text-center text-sm text-text-secondary">No tasks here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyTasks;
